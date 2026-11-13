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
  PeriodStatus,
  PeriodType,
  Prisma,
} from '../../generated/prisma/client.ts';
import type { WeekDay } from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { CreateTimetableEntryDto } from './dto/create-timetable-entry.dto.ts';
import { UpdateTimetableEntryDto } from './dto/update-timetable-entry.dto.ts';
import { FindTimetableQueryDto } from './dto/find-timetable-query.dto.ts';
import {
  TimetableEntriesResponseDto,
  TimetableEntryFindOneResponseDto,
} from './dto/timetable-response.dto.ts';
import { TimetableClassSectionsResponseDto } from './dto/class-sections-response.dto.ts';
import { CheckTeacherAvailabilityQueryDto } from './dto/check-teacher-availability-query.dto.ts';
import { CheckTeacherAvailabilityResponseDto } from './dto/check-teacher-availability-response.dto.ts';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateTimetableEntryDto,
    schoolId: string,
  ): Promise<TimetableEntryFindOneResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      await this.validateReferences(dto, schoolId);
      await this.ensureWorkingDay(dto.day, schoolId);
      await this.ensureSlotFree(dto);
      await this.ensureTeacherFree(
        dto.teacherId,
        dto.academicTermId,
        dto.periodId,
        dto.day,
      );

      const entry = await this.prisma.timetableEntry.create({
        data: {
          schoolId,
          classSectionId: dto.classSectionId.trim(),
          academicTermId: dto.academicTermId.trim(),
          periodId: dto.periodId.trim(),
          day: dto.day,
          subjectId: dto.subjectId.trim(),
          teacherId: dto.teacherId.trim(),
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Timetable entry created successfully.',
        data: entry,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(
    query: FindTimetableQueryDto,
    schoolId: string,
  ): Promise<TimetableEntriesResponseDto> {
    if (!schoolId?.trim()) {
      throw new BadRequestException('School context is required.');
    }

    const { classSectionId, academicTermId, subjectId, teacherId } = query;
    const where: Prisma.TimetableEntryWhereInput = {
      schoolId,
      ...(classSectionId && { classSectionId }),
      ...(academicTermId && { academicTermId }),
      ...(subjectId && { subjectId }),
      ...(teacherId && { teacherId }),
    };

    try {
      const [data, total] = await Promise.all([
        this.prisma.timetableEntry.findMany({
          where,
          orderBy: [{ period: { sortOrder: 'asc' } }, { id: 'asc' }],
        }),
        this.prisma.timetableEntry.count({ where }),
      ]);

      return {
        data,
        total,
        message: 'Timetable entries retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve timetable entries.',
      );
    }
  }

  async checkTeacherAvailability(
    query: CheckTeacherAvailabilityQueryDto,
    schoolId: string,
  ): Promise<CheckTeacherAvailabilityResponseDto> {
    if (!schoolId?.trim()) {
      throw new BadRequestException('School context is required.');
    }

    await this.ensureTeacher(query.teacherId, schoolId);

    const entry = await this.prisma.timetableEntry.findFirst({
      where: {
        schoolId,
        teacherId: query.teacherId.trim(),
        academicTermId: query.academicTermId.trim(),
        periodId: query.periodId.trim(),
        day: query.day,
        ...(query.excludeClassSectionId?.trim() && {
          classSectionId: { not: query.excludeClassSectionId.trim() },
        }),
      },
      include: {
        classSection: {
          include: {
            class: { select: { name: true } },
            section: { select: { name: true } },
          },
        },
      },
    });

    if (!entry) {
      return {
        statusCode: HttpStatus.OK,
        conflict: false,
        message: 'Teacher is free in this period.',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      conflict: true,
      message: `Teacher is already assigned to Class ${entry.classSection.class.name} - ${entry.classSection.section.name} in this period.`,
    };
  }

  async findClassSections(
    schoolId: string,
  ): Promise<TimetableClassSectionsResponseDto> {
    if (!schoolId?.trim()) {
      throw new BadRequestException('School context is required.');
    }

    try {
      const classSections = await this.prisma.classSection.findMany({
        where: { class: { schoolId } },
        select: {
          id: true,
          classId: true,
          sectionId: true,
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
        orderBy: [
          { class: { name: 'asc' } },
          { section: { name: 'asc' } },
        ],
      });

      const data = classSections.map((classSection) => ({
        id: classSection.id,
        classId: classSection.classId,
        sectionId: classSection.sectionId,
        name: `${classSection.class.name} - ${classSection.section.name}`,
      }));

      return {
        data,
        total: data.length,
        message: 'Class sections retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve class sections.',
      );
    }
  }

  async update(
    id: string,
    schoolId: string,
    dto: UpdateTimetableEntryDto,
  ): Promise<TimetableEntryFindOneResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const current = await this.prisma.timetableEntry.findUnique({
        where: { id, schoolId },
        select: {
          id: true,
          academicTermId: true,
          periodId: true,
          day: true,
        },
      });

      if (!current) {
        throw new NotFoundException(
          `Timetable entry with ID "${id}" was not found.`,
        );
      }

      if (dto.subjectId !== undefined) {
        await this.ensureSubject(dto.subjectId, schoolId);
      }

      if (dto.teacherId !== undefined) {
        await this.ensureTeacher(dto.teacherId, schoolId);
        await this.ensureTeacherFree(
          dto.teacherId,
          current.academicTermId,
          current.periodId,
          current.day,
          id,
        );
      }

      const entry = await this.prisma.timetableEntry.update({
        where: { id },
        data: {
          subjectId: dto.subjectId?.trim(),
          teacherId: dto.teacherId?.trim(),
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Timetable entry updated successfully.',
        data: entry,
      };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const entry = await this.prisma.timetableEntry.findUnique({
        where: { id, schoolId },
        select: { id: true },
      });

      if (!entry) {
        throw new NotFoundException(
          `Timetable entry with ID "${id}" was not found.`,
        );
      }

      await this.prisma.timetableEntry.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private async validateReferences(
    dto: CreateTimetableEntryDto,
    schoolId: string,
  ): Promise<void> {
    const [classSection, academicTerm, period, subject, teacher] =
      await Promise.all([
        this.prisma.classSection.findFirst({
          where: { id: dto.classSectionId.trim(), class: { schoolId } },
          select: { id: true },
        }),
        this.prisma.academicTerm.findFirst({
          where: { id: dto.academicTermId.trim(), schoolId },
          select: { id: true },
        }),
        this.prisma.period.findFirst({
          where: { id: dto.periodId.trim(), schoolId },
          select: { id: true, type: true, status: true },
        }),
        this.prisma.subject.findFirst({
          where: { id: dto.subjectId.trim(), schoolId },
          select: { id: true },
        }),
        this.prisma.teacher.findFirst({
          where: { id: dto.teacherId.trim(), schoolId },
          select: { id: true },
        }),
      ]);

    if (!classSection) {
      throw new BadRequestException(
        'Select a valid class section for this school.',
      );
    }
    if (!academicTerm) {
      throw new BadRequestException(
        'Select a valid academic term for this school.',
      );
    }
    if (!period) {
      throw new BadRequestException('Select a valid period for this school.');
    }
    if (period.type !== PeriodType.PERIOD) {
      throw new BadRequestException('Breaks cannot be assigned to a class.');
    }
    if (period.status !== PeriodStatus.ACTIVE) {
      throw new BadRequestException('Select an active period.');
    }
    if (!subject) {
      throw new BadRequestException('Select a valid subject for this school.');
    }
    if (!teacher) {
      throw new BadRequestException('Select a valid teacher for this school.');
    }
  }

  private async ensureSubject(
    subjectId: string,
    schoolId: string,
  ): Promise<void> {
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId.trim(), schoolId },
      select: { id: true },
    });

    if (!subject) {
      throw new BadRequestException('Select a valid subject for this school.');
    }
  }

  private async ensureTeacher(
    teacherId: string,
    schoolId: string,
  ): Promise<void> {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id: teacherId.trim(), schoolId },
      select: { id: true },
    });

    if (!teacher) {
      throw new BadRequestException('Select a valid teacher for this school.');
    }
  }

  private async ensureWorkingDay(
    day: WeekDay,
    schoolId: string,
  ): Promise<void> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { workingDays: true },
    });

    if (!school) {
      throw new BadRequestException('School context is required.');
    }

    const isWorkingDay = school.workingDays.some(
      (workingDay) => workingDay.toUpperCase() === day,
    );

    if (!isWorkingDay) {
      throw new BadRequestException(
        'Selected day is not a working day for this school.',
      );
    }
  }

  private async ensureSlotFree(
    dto: CreateTimetableEntryDto,
  ): Promise<void> {
    const existing = await this.prisma.timetableEntry.findFirst({
      where: {
        classSectionId: dto.classSectionId.trim(),
        academicTermId: dto.academicTermId.trim(),
        periodId: dto.periodId.trim(),
        day: dto.day,
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        'This period is already assigned for this class.',
      );
    }
  }

  private async ensureTeacherFree(
    teacherId: string,
    academicTermId: string,
    periodId: string,
    day: WeekDay,
    excludeId?: string,
  ): Promise<void> {
    const conflict = await this.prisma.timetableEntry.findFirst({
      where: {
        teacherId: teacherId.trim(),
        academicTermId: academicTermId.trim(),
        periodId: periodId.trim(),
        day,
        ...(excludeId && { id: { not: excludeId } }),
      },
      include: {
        classSection: {
          select: {
            class: { select: { name: true } },
            section: { select: { name: true } },
          },
        },
      },
    });

    if (conflict) {
      throw new ConflictException(
        `Teacher is already assigned to Class ${conflict.classSection.class.name}-${conflict.classSection.section.name} in this period.`,
      );
    }
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof HttpException) throw error;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target)
          ? (error.meta.target as string[])
          : [];

        if (target.includes('teacherId')) {
          throw new ConflictException(
            'This teacher is already assigned in this period.',
          );
        }

        throw new ConflictException(
          'This period is already assigned for this class.',
        );
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'One of the selected records is no longer available.',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Timetable entry with ID "${id}" was not found.`,
        );
      }
    }

    throw new InternalServerErrorException('Timetable operation failed.');
  }
}
