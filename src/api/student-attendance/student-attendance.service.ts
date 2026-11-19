import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  Prisma,
  StudentAttendanceStatus,
  StudentStatus,
} from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { FindStudentAttendanceQueryDto } from './dto/find-student-attendance-query.dto.ts';
import { ReportStudentAttendanceQueryDto } from './dto/report-student-attendance-query.dto.ts';
import type { StudentAttendanceReportBand } from './dto/report-student-attendance-query.dto.ts';
import { SaveStudentAttendanceDto } from './dto/save-student-attendance.dto.ts';
import {
  SaveStudentAttendanceResponseDto,
  StudentAttendanceListResponseDto,
  StudentAttendanceReportResponseDto,
} from './dto/student-attendance-response.dto.ts';
import type { StudentAttendanceReportBandStatus } from './dto/student-attendance-response.dto.ts';

const SCHOOL_TIME_ZONE = 'Asia/Karachi';
const DEFAULT_LIMIT = 10;

type ClassRef = {
  id: string;
  name: string;
};

type ReportAccumulator = {
  studentId: string;
  roll: string;
  name: string;
  days: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
};

@Injectable()
export class StudentAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: FindStudentAttendanceQueryDto,
    schoolId: string,
  ): Promise<StudentAttendanceListResponseDto> {
    this.ensureSchoolContext(schoolId);

    const { limit = DEFAULT_LIMIT, offset = 0 } = query;
    const date = this.toDateOnly(query.date);
    const classroom = await this.findClass(query.classId, schoolId);
    const classSectionId = query.classSectionId?.trim();

    try {
      const where: Prisma.StudentWhereInput = {
        schoolId,
        classId: classroom.id,
        ...(classSectionId && { classSectionId }),
        status: StudentStatus.ACTIVE,
      };

      const [students, total] = await Promise.all([
        this.prisma.student.findMany({
          where,
          select: { id: true, firstName: true, lastName: true, roll: true },
          take: limit,
          skip: offset,
          orderBy: [{ roll: 'asc' }, { id: 'asc' }],
        }),
        this.prisma.student.count({ where }),
      ]);

      const records = students.length
        ? await this.prisma.studentAttendance.findMany({
            where: {
              schoolId,
              date,
              studentId: { in: students.map((student) => student.id) },
            },
            select: { id: true, studentId: true, status: true, remarks: true },
          })
        : [];
      const recordsByStudent = new Map(
        records.map((record) => [record.studentId, record]),
      );

      return {
        data: students.map((student) => {
          const record = recordsByStudent.get(student.id);

          return {
            studentId: student.id,
            attendanceId: record?.id ?? null,
            roll: student.roll,
            name: `${student.firstName} ${student.lastName}`.trim(),
            classId: classroom.id,
            className: classroom.name,
            status: record?.status ?? null,
            remarks: record?.remarks ?? null,
          };
        }),
        total,
        message: 'Student attendance retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve student attendance.',
      );
    }
  }

  async saveBulk(
    dto: SaveStudentAttendanceDto,
    schoolId: string,
  ): Promise<SaveStudentAttendanceResponseDto> {
    this.ensureSchoolContext(schoolId);

    const date = this.toDateOnly(dto.date);
    this.ensureNotFuture(date);
    const classroom = await this.findClass(dto.classId, schoolId);
    const studentIds = dto.records.map((record) => record.studentId);

    if (new Set(studentIds).size !== studentIds.length) {
      throw new BadRequestException(
        'Duplicate students in the attendance list.',
      );
    }

    try {
      const students = await this.prisma.student.findMany({
        where: {
          id: { in: studentIds },
          schoolId,
          classId: classroom.id,
          status: StudentStatus.ACTIVE,
        },
        select: { id: true },
      });

      if (students.length !== studentIds.length) {
        throw new BadRequestException(
          'One or more students do not belong to the selected class.',
        );
      }

      await this.prisma.$transaction(
        dto.records.map((record) =>
          this.prisma.studentAttendance.upsert({
            where: { studentId_date: { studentId: record.studentId, date } },
            update: {
              classId: classroom.id,
              status: record.status,
              remarks: this.normalizeRemarks(record.remarks),
            },
            create: {
              schoolId,
              studentId: record.studentId,
              classId: classroom.id,
              date,
              status: record.status,
              remarks: this.normalizeRemarks(record.remarks),
            },
          }),
        ),
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Attendance saved successfully.',
        data: { saved: dto.records.length },
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async report(
    query: ReportStudentAttendanceQueryDto,
    schoolId: string,
  ): Promise<StudentAttendanceReportResponseDto> {
    this.ensureSchoolContext(schoolId);

    const { start, end } = this.getMonthRange(query.month);
    const band = query.band ?? 'all';
    const { limit = DEFAULT_LIMIT, offset = 0 } = query;
    const classroom = await this.findClass(query.classId, schoolId);
    const classSectionId = query.classSectionId?.trim();

    try {
      const [students, school] = await Promise.all([
        this.prisma.student.findMany({
          where: {
            schoolId,
            classId: classroom.id,
            ...(classSectionId && { classSectionId }),
            status: StudentStatus.ACTIVE,
          },
          select: { id: true, firstName: true, lastName: true, roll: true },
          orderBy: [{ roll: 'asc' }, { id: 'asc' }],
        }),
        this.prisma.school.findUnique({
          where: { id: schoolId },
          select: { workingDays: true },
        }),
      ]);

      const records = students.length
        ? await this.prisma.studentAttendance.findMany({
            where: {
              schoolId,
              date: { gte: start, lt: end },
              studentId: { in: students.map((student) => student.id) },
            },
            select: { studentId: true, date: true, status: true },
          })
        : [];

      const grouped = new Map<string, ReportAccumulator>();

      for (const student of students) {
        grouped.set(student.id, {
          studentId: student.id,
          roll: student.roll,
          name: `${student.firstName} ${student.lastName}`.trim(),
          days: 0,
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
        });
      }

      for (const record of records) {
        const entry = grouped.get(record.studentId);
        if (!entry) continue;

        entry.days += 1;
        if (record.status === StudentAttendanceStatus.PRESENT) entry.present += 1;
        else if (record.status === StudentAttendanceStatus.ABSENT)
          entry.absent += 1;
        else if (record.status === StudentAttendanceStatus.LATE) entry.late += 1;
        else entry.leave += 1;
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
        .sort((first, second) =>
          first.roll.localeCompare(second.roll, undefined, { numeric: true }),
        );

      const filtered = rows.filter((row) => this.matchesBand(row.percent, band));
      const totalDays = rows.reduce((sum, row) => sum + row.days, 0);
      const totalPresent = rows.reduce((sum, row) => sum + row.present, 0);

      return {
        statusCode: HttpStatus.OK,
        message: 'Student attendance report generated successfully.',
        data: filtered.slice(offset, offset + limit),
        total: filtered.length,
        summary: {
          averagePercent: totalDays
            ? Math.round((totalPresent / totalDays) * 100)
            : 0,
          workingDays: this.countWorkingDays(
            start,
            end,
            school?.workingDays ?? [],
            records,
          ),
          below75Count: rows.filter((row) => row.percent < 75).length,
          perfectCount: rows.filter((row) => row.percent === 100).length,
          totalStudents: rows.length,
        },
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to generate student attendance report.',
      );
    }
  }

  private ensureSchoolContext(schoolId: string): void {
    if (!schoolId?.trim()) {
      throw new BadRequestException('School context is required.');
    }
  }

  private async findClass(
    classId: string,
    schoolId: string,
  ): Promise<ClassRef> {
    const classroom = await this.prisma.class.findUnique({
      where: { id: classId.trim(), schoolId },
      select: { id: true, name: true },
    });

    if (!classroom) {
      throw new BadRequestException('Select a valid class for this school.');
    }

    return classroom;
  }

  private ensureNotFuture(date: Date): void {
    const today = this.getTodayDate();

    if (date.getTime() > today.getTime()) {
      throw new BadRequestException(
        'Attendance cannot be marked for a future date.',
      );
    }
  }

  private getTodayDate(): Date {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: SCHOOL_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    return this.toDateOnly(today);
  }

  private getMonthRange(month: string): { start: Date; end: Date } {
    const [year, monthNumber] = month.split('-').map(Number);

    return {
      start: new Date(Date.UTC(year, monthNumber - 1, 1)),
      end: new Date(Date.UTC(year, monthNumber, 1)),
    };
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

  private normalizeRemarks(remarks?: string): string | null {
    const value = remarks?.trim();
    return value ? value : null;
  }

  private countWorkingDays(
    start: Date,
    end: Date,
    workingDays: string[],
    records: { date: Date }[],
  ): number {
    if (workingDays.length === 0) {
      return new Set(
        records.map((record) => record.date.toISOString().slice(0, 10)),
      ).size;
    }

    const allowedDays = new Set(
      workingDays.map((workingDay) => workingDay.toUpperCase()),
    );
    const cursor = new Date(start);
    let count = 0;

    while (cursor < end) {
      const weekday = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        weekday: 'long',
      })
        .format(cursor)
        .toUpperCase();

      if (allowedDays.has(weekday)) count += 1;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return count;
  }

  private reportStatus(percent: number): StudentAttendanceReportBandStatus {
    if (percent >= 90) return 'Good';
    if (percent >= 75) return 'Watch';
    return 'Low';
  }

  private matchesBand(
    percent: number,
    band: StudentAttendanceReportBand,
  ): boolean {
    if (band === 'good') return percent >= 90;
    if (band === 'watch') return percent >= 75 && percent < 90;
    if (band === 'low') return percent < 75;
    if (band === 'perfect') return percent === 100;
    return true;
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) throw error;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Attendance for this student and date already exists.',
        );
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'One of the selected records is no longer available.',
        );
      }
    }

    throw new InternalServerErrorException(
      'Student attendance operation failed.',
    );
  }
}
