import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  TeacherAttendanceSource,
  TeacherAttendanceStatus,
} from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { FindTeacherAttendanceQueryDto } from './dto/find-teacher-attendance-query.dto.ts';
import { ReportTeacherAttendanceQueryDto } from './dto/report-teacher-attendance-query.dto.ts';
import type { ReportBand } from './dto/report-teacher-attendance-query.dto.ts';
import { UpdateTeacherAttendanceDto } from './dto/update-teacher-attendance.dto.ts';
import {
  MarkAttendanceTodayResponseDto,
  TeacherAttendanceFindOneResponseDto,
  TeacherAttendanceListResponseDto,
  TeacherAttendanceReportResponseDto,
  TeacherAttendanceTeacherDto,
} from './dto/teacher-attendance-response.dto.ts';
import type { TeacherAttendanceReportBandStatus } from './dto/teacher-attendance-response.dto.ts';

const SCHOOL_TIME_ZONE = 'Asia/Karachi';
const LATE_GRACE_MINUTES = 10;
const DEFAULT_OPENING_TIME = '08:00';

const teacherSelect = {
  id: true,
  firstName: true,
  lastName: true,
  employeeId: true,
} as const;

const teacherInclude = {
  teacher: { select: teacherSelect },
} as const;

type SchoolSchedule = {
  openingTime: string | null;
  closingTime: string | null;
  workingDays: string[];
};

type NowParts = {
  date: string;
  time: string;
  day: string;
};

type ReportAccumulator = {
  teacherId: string;
  teacherName: string;
  employeeId: string | null;
  days: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
};

@Injectable()
export class TeacherAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findToday(
    userId: string,
    schoolId: string,
  ): Promise<MarkAttendanceTodayResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const [teacher, school] = await Promise.all([
        this.resolveTeacher(userId, schoolId),
        this.getSchoolSchedule(schoolId),
      ]);
      const now = this.getNowParts();
      const record = await this.prisma.teacherAttendance.findUnique({
        where: {
          teacherId_date: {
            teacherId: teacher.id,
            date: this.toDateOnly(now.date),
          },
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: record
          ? 'Attendance retrieved successfully.'
          : 'No attendance recorded for today.',
        data: record,
        teacher,
        shift: {
          openingTime: school.openingTime,
          closingTime: school.closingTime,
        },
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findWeekly(
    userId: string,
    schoolId: string,
  ): Promise<TeacherAttendanceListResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const teacher = await this.resolveTeacher(userId, schoolId);
      const { start, end } = this.getWeekRange();
      const data = await this.prisma.teacherAttendance.findMany({
        where: {
          teacherId: teacher.id,
          date: { gte: start, lt: end },
        },
        orderBy: { date: 'asc' },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Weekly attendance retrieved successfully.',
        data,
        total: data.length,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async checkIn(
    userId: string,
    schoolId: string,
  ): Promise<TeacherAttendanceFindOneResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const [teacher, school] = await Promise.all([
        this.resolveTeacher(userId, schoolId),
        this.getSchoolSchedule(schoolId),
      ]);
      const now = this.getNowParts();
      this.ensureWorkingDay(now.day, school);
      this.ensureWithinSchoolHours(now.time, school);

      const date = this.toDateOnly(now.date);
      const existing = await this.prisma.teacherAttendance.findUnique({
        where: { teacherId_date: { teacherId: teacher.id, date } },
      });

      if (existing?.checkIn) {
        throw new ConflictException(
          'Attendance for today is already checked in.',
        );
      }

      if (existing?.status === TeacherAttendanceStatus.LEAVE) {
        throw new ConflictException('You are marked on leave today.');
      }

      const lateMinutes = this.calculateLateMinutes(
        now.time,
        school.openingTime,
      );
      const status =
        lateMinutes > 0
          ? TeacherAttendanceStatus.LATE
          : TeacherAttendanceStatus.PRESENT;
      const data = {
        status,
        checkIn: now.time,
        checkOut: null,
        lateMinutes: lateMinutes > 0 ? lateMinutes : null,
        source: TeacherAttendanceSource.SELF_CHECK_IN,
      };

      const record = existing
        ? await this.prisma.teacherAttendance.update({
            where: { id: existing.id },
            data,
          })
        : await this.prisma.teacherAttendance.create({
            data: {
              schoolId,
              teacherId: teacher.id,
              date,
              ...data,
            },
          });

      return {
        statusCode: HttpStatus.OK,
        message:
          lateMinutes > 0
            ? `Checked in at ${now.time} (late by ${lateMinutes} min).`
            : `Checked in at ${now.time}.`,
        data: { ...record, teacher },
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async checkOut(
    userId: string,
    schoolId: string,
  ): Promise<TeacherAttendanceFindOneResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const teacher = await this.resolveTeacher(userId, schoolId);
      const now = this.getNowParts();
      const date = this.toDateOnly(now.date);
      const existing = await this.prisma.teacherAttendance.findUnique({
        where: { teacherId_date: { teacherId: teacher.id, date } },
      });

      if (!existing?.checkIn) {
        throw new BadRequestException(
          'Check in before checking out for today.',
        );
      }

      if (existing.checkOut) {
        throw new ConflictException(
          'Attendance for today is already checked out.',
        );
      }

      if (this.toMinutes(now.time) < this.toMinutes(existing.checkIn)) {
        throw new BadRequestException(
          'Check-out time cannot be earlier than check-in time.',
        );
      }

      const record = await this.prisma.teacherAttendance.update({
        where: { id: existing.id },
        data: { checkOut: now.time },
      });

      return {
        statusCode: HttpStatus.OK,
        message: `Checked out at ${now.time}.`,
        data: { ...record, teacher },
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(
    query: FindTeacherAttendanceQueryDto,
    schoolId: string,
  ): Promise<TeacherAttendanceListResponseDto> {
    this.ensureSchoolContext(schoolId);

    const { limit = 10, offset = 0, searchKey, date, teacherId, status } = query;
    const where: Prisma.TeacherAttendanceWhereInput = {
      schoolId,
      ...(teacherId && { teacherId }),
      ...(status && { status }),
      ...(date && { date: this.toDateOnly(date) }),
      ...(searchKey && {
        teacher: {
          OR: [
            { firstName: { contains: searchKey, mode: 'insensitive' } },
            { lastName: { contains: searchKey, mode: 'insensitive' } },
            { employeeId: { contains: searchKey, mode: 'insensitive' } },
          ],
        },
      }),
    };

    try {
      const [data, total] = await Promise.all([
        this.prisma.teacherAttendance.findMany({
          where,
          include: teacherInclude,
          take: limit,
          skip: offset,
          orderBy: [{ date: 'desc' }, { teacher: { firstName: 'asc' } }],
        }),
        this.prisma.teacherAttendance.count({ where }),
      ]);

      return {
        statusCode: HttpStatus.OK,
        message: 'Teacher attendance retrieved successfully.',
        data,
        total,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve teacher attendance.',
      );
    }
  }

  async report(
    query: ReportTeacherAttendanceQueryDto,
    schoolId: string,
  ): Promise<TeacherAttendanceReportResponseDto> {
    this.ensureSchoolContext(schoolId);

    const [year, month] = query.month.split('-').map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    try {
      const records = await this.prisma.teacherAttendance.findMany({
        where: {
          schoolId,
          date: { gte: start, lt: end },
        },
        include: teacherInclude,
        orderBy: [{ date: 'asc' }],
      });

      const grouped = new Map<string, ReportAccumulator>();

      for (const record of records) {
        const teacherName =
          `${record.teacher.firstName} ${record.teacher.lastName ?? ''}`.trim();
        const entry = grouped.get(record.teacherId) ?? {
          teacherId: record.teacherId,
          teacherName,
          employeeId: record.teacher.employeeId,
          days: 0,
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
        };

        entry.days += 1;
        if (record.status === TeacherAttendanceStatus.PRESENT) entry.present += 1;
        else if (record.status === TeacherAttendanceStatus.ABSENT)
          entry.absent += 1;
        else if (record.status === TeacherAttendanceStatus.LATE) entry.late += 1;
        else entry.leave += 1;

        grouped.set(record.teacherId, entry);
      }

      const rows = [...grouped.values()]
        .map((entry) => {
          const percent = entry.days
            ? Math.round((entry.present / entry.days) * 100)
            : 0;

          return {
            ...entry,
            percent,
            status: this.reportStatus(percent),
          };
        })
        .filter((row) => this.matchesBand(row.percent, query.band ?? 'all'))
        .sort((first, second) =>
          first.teacherName.localeCompare(second.teacherName),
        );

      return {
        statusCode: HttpStatus.OK,
        message: 'Teacher attendance report generated successfully.',
        data: rows,
        total: rows.length,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to generate teacher attendance report.',
      );
    }
  }

  async findOne(
    id: string,
    schoolId: string,
  ): Promise<TeacherAttendanceFindOneResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const record = await this.prisma.teacherAttendance.findUnique({
        where: { id, schoolId },
        include: teacherInclude,
      });

      if (!record) {
        throw new NotFoundException(
          `Teacher attendance with ID "${id}" was not found.`,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Teacher attendance retrieved successfully.',
        data: record,
      };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async update(
    id: string,
    schoolId: string,
    dto: UpdateTeacherAttendanceDto,
  ): Promise<TeacherAttendanceFindOneResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const [current, school] = await Promise.all([
        this.prisma.teacherAttendance.findUnique({
          where: { id, schoolId },
        }),
        this.getSchoolSchedule(schoolId),
      ]);

      if (!current) {
        throw new NotFoundException(
          `Teacher attendance with ID "${id}" was not found.`,
        );
      }

      const data: Prisma.TeacherAttendanceUpdateInput = {
        source: TeacherAttendanceSource.ADMIN_EDIT,
      };
      const status = dto.status ?? current.status;
      const attending =
        status === TeacherAttendanceStatus.PRESENT ||
        status === TeacherAttendanceStatus.LATE;

      if (attending) {
        const checkIn = dto.checkIn ?? current.checkIn;
        if (!checkIn) {
          throw new BadRequestException(
            'Check-in time is required for present or late attendance.',
          );
        }

        const lateMinutes = this.calculateLateMinutes(
          checkIn,
          school.openingTime,
        );
        const checkOut = dto.checkOut ?? current.checkOut;

        if (checkOut && this.toMinutes(checkOut) < this.toMinutes(checkIn)) {
          throw new BadRequestException(
            'Check-out time cannot be earlier than check-in time.',
          );
        }

        data.status =
          lateMinutes > 0
            ? TeacherAttendanceStatus.LATE
            : TeacherAttendanceStatus.PRESENT;
        data.checkIn = checkIn;
        data.checkOut = checkOut ?? null;
        data.lateMinutes = lateMinutes > 0 ? lateMinutes : null;
      } else {
        data.status = status;
        data.checkIn = null;
        data.checkOut = null;
        data.lateMinutes = null;
      }

      if (dto.remarks !== undefined) {
        data.remarks = dto.remarks.trim() || null;
      }

      const record = await this.prisma.teacherAttendance.update({
        where: { id },
        data,
        include: teacherInclude,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Teacher attendance updated successfully.',
        data: record,
      };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(
    id: string,
    schoolId: string,
  ): Promise<TeacherAttendanceFindOneResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const record = await this.prisma.teacherAttendance.findUnique({
        where: { id, schoolId },
        include: teacherInclude,
      });

      if (!record) {
        throw new NotFoundException(
          `Teacher attendance with ID "${id}" was not found.`,
        );
      }

      await this.prisma.teacherAttendance.delete({ where: { id } });

      return {
        statusCode: HttpStatus.OK,
        message: 'Teacher attendance deleted successfully.',
        data: record,
      };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private ensureSchoolContext(schoolId: string): void {
    if (!schoolId?.trim()) {
      throw new BadRequestException('School context is required.');
    }
  }

  private async resolveTeacher(
    userId: string,
    schoolId: string,
  ): Promise<TeacherAttendanceTeacherDto> {
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        userId,
        OR: [{ schoolId }, { schoolId: null }],
      },
      select: teacherSelect,
      orderBy: { createdAt: 'asc' },
    });

    if (!teacher) {
      throw new NotFoundException(
        'No teacher profile is linked to this account for this school.',
      );
    }

    return teacher;
  }

  private async getSchoolSchedule(schoolId: string): Promise<SchoolSchedule> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { openingTime: true, closingTime: true, workingDays: true },
    });

    if (!school) {
      throw new BadRequestException('School context is required.');
    }

    return school;
  }

  private ensureWorkingDay(day: string, school: SchoolSchedule): void {
    const isWorkingDay = school.workingDays.some(
      (workingDay) => workingDay.toUpperCase() === day,
    );

    if (!isWorkingDay) {
      throw new BadRequestException(
        'Today is not a working day for this school.',
      );
    }
  }

  private ensureWithinSchoolHours(time: string, school: SchoolSchedule): void {
    if (!school.openingTime || !school.closingTime) {
      throw new BadRequestException(
        'School timings are not set. Check-in is unavailable.',
      );
    }

    const current = this.toMinutes(time);

    if (current < this.toMinutes(school.openingTime)) {
      throw new BadRequestException(
        `Check-in opens at ${school.openingTime}.`,
      );
    }

    if (current > this.toMinutes(school.closingTime)) {
      throw new BadRequestException(
        'School hours are over. Check-in is closed for today.',
      );
    }
  }

  private getNowParts(): NowParts {
    const now = new Date();
    const date = new Intl.DateTimeFormat('en-CA', {
      timeZone: SCHOOL_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: SCHOOL_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(now);
    const day = new Intl.DateTimeFormat('en-US', {
      timeZone: SCHOOL_TIME_ZONE,
      weekday: 'long',
    })
      .format(now)
      .toUpperCase();

    return { date, time, day };
  }

  private getWeekRange(): { start: Date; end: Date } {
    const today = this.toDateOnly(this.getNowParts().date);
    const weekday = today.getUTCDay();
    const daysSinceMonday = weekday === 0 ? 6 : weekday - 1;
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - daysSinceMonday);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 7);

    return { start, end };
  }

  private toDateOnly(value: string): Date {
    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new BadRequestException('Invalid date.');
    }

    return date;
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private calculateLateMinutes(
    checkIn: string,
    openingTime: string | null,
  ): number {
    const start = this.toMinutes(openingTime ?? DEFAULT_OPENING_TIME);
    return Math.max(0, this.toMinutes(checkIn) - start - LATE_GRACE_MINUTES);
  }

  private reportStatus(percent: number): TeacherAttendanceReportBandStatus {
    if (percent >= 90) return 'Good';
    if (percent >= 75) return 'Watch';
    return 'Low';
  }

  private matchesBand(percent: number, band: ReportBand): boolean {
    if (band === 'good') return percent >= 90;
    if (band === 'watch') return percent >= 75 && percent < 90;
    if (band === 'low') return percent < 75;
    if (band === 'perfect') return percent === 100;
    return true;
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof HttpException) throw error;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Attendance for this teacher and date already exists.',
        );
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'One of the selected records is no longer available.',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Teacher attendance with ID "${id}" was not found.`,
        );
      }
    }

    throw new InternalServerErrorException('Teacher attendance operation failed.');
  }
}
