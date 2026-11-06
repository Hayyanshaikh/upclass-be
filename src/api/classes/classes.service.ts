import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import {
  CreateClassDto,
  CreateClassSubjectDto,
} from './dto/create-class.dto.ts';
import { UpdateClassDto } from './dto/update-class.dto.ts';
import { ClassFiltersDto } from './dto/class-filters.dto.ts';
import {
  ClassDto,
  ClassFindOneResponseDto,
} from './dto/classes-response.dto.ts';
import { LookupResponseDto } from '../../common/dto/lookup-response.dto.ts';

export interface ClassesListResponse {
  statusCode: number;
  message: string;
  data: ClassDto[];
  total: number;
  warning?: string;
}

@Injectable()
export class ClassesService {
  private readonly logger = new Logger(ClassesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateClassDto,
    schoolId: string,
  ): Promise<ClassFindOneResponseDto> {
    const {
      name,
      section,
      room,
      capacity,
      academicYearId,
      status,
      teacherId,
      assistantTeacherId,
      subjects,
    } = dto;

    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const normalizedSection = section?.trim().toUpperCase();

      if (!name?.trim()) {
        throw new BadRequestException('Class name is required.');
      }
      if (!normalizedSection) {
        throw new BadRequestException('Section is required.');
      }
      if (!room?.trim()) {
        throw new BadRequestException('Room is required.');
      }
      if (!academicYearId?.trim()) {
        throw new BadRequestException('Academic year is required.');
      }
      if (!teacherId?.trim()) {
        throw new BadRequestException('Class teacher is required.');
      }
      if (!Number.isInteger(capacity) || capacity < 1) {
        throw new BadRequestException(
          'Capacity must be a positive whole number.',
        );
      }

      const academicYear = await this.prisma.academicYear.findUnique({
        where: { id: academicYearId.trim(), schoolId },
        select: { id: true },
      });
      if (!academicYear) {
        throw new BadRequestException(
          'Select a valid academic year for this school.',
        );
      }

      const nextTeacherId = teacherId.trim();
      const nextAssistantTeacherId = assistantTeacherId?.trim() || null;
      if (nextAssistantTeacherId === nextTeacherId) {
        throw new BadRequestException('Choose a different assistant teacher.');
      }

      const subjectRows = this.normalizeSubjects(subjects);
      const availableTeacherIds = await this.findAvailableTeacherIds([
        nextTeacherId,
        ...(nextAssistantTeacherId ? [nextAssistantTeacherId] : []),
        ...subjectRows.map((row) => row.teacherId),
      ]);
      const availableSubjectIds = await this.findAvailableSubjectIds(
        subjectRows.map((row) => row.subjectId),
        schoolId,
      );

      if (!availableTeacherIds.has(nextTeacherId)) {
        throw new BadRequestException('Select an available class teacher.');
      }
      if (
        nextAssistantTeacherId &&
        !availableTeacherIds.has(nextAssistantTeacherId)
      ) {
        throw new BadRequestException('Select an available assistant teacher.');
      }
      if (subjectRows.some((row) => !availableTeacherIds.has(row.teacherId))) {
        throw new BadRequestException(
          'Select an available teacher for each subject.',
        );
      }
      if (subjectRows.some((row) => !availableSubjectIds.has(row.subjectId))) {
        throw new BadRequestException(
          'Select an available subject for each row.',
        );
      }

      const schoolClass = await this.prisma.class.create({
        data: {
          schoolId,
          name: name.trim(),
          section: normalizedSection,
          room: room.trim(),
          capacity,
          academicYearId: academicYear.id,
          status,
          teacherId: nextTeacherId,
          assistantTeacherId: nextAssistantTeacherId,
          subjects: {
            create: subjectRows,
          },
        },
        include: {
          academicYear: true,
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Class created successfully.',
        data: schoolClass,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A class with the same name, section and academic year already exists.',
        );
      }
      this.handlePrismaError(error);
    }
  }

  async findAll(
    query: ClassFiltersDto,
    schoolId: string,
  ): Promise<ClassesListResponse> {
    const { teacher, status, searchKey, limit = 10, offset = 0 } = query;
    const where: Prisma.ClassWhereInput = {
      schoolId,
      ...(teacher && { teacherId: teacher }),
      ...(status && { status }),
      ...(searchKey && {
        OR: [
          { name: { contains: searchKey, mode: 'insensitive' } },
          { section: { contains: searchKey, mode: 'insensitive' } },
          { room: { contains: searchKey, mode: 'insensitive' } },
          {
            teacher: {
              OR: [
                { firstName: { contains: searchKey, mode: 'insensitive' } },
                { lastName: { contains: searchKey, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
    };

    try {
      const [data, total] = await Promise.all([
        this.prisma.class.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: [{ name: 'asc' }, { section: 'asc' }, { id: 'asc' }],
          include: {
            academicYear: true,
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        }),
        this.prisma.class.count({ where }),
      ]);

      return {
        data,
        total,
        message: 'Classes retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve classes.');
    }
  }

  async lookup(schoolId: string): Promise<LookupResponseDto> {
    const classes = await this.prisma.class.findMany({
      where: {
        schoolId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return {
      data: classes,
      total: classes.length,
      message: 'Classes retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  async findOne(
    id: string,
    schoolId: string,
  ): Promise<ClassFindOneResponseDto> {
    try {
      const schoolClass = await this.prisma.class.findUnique({
        where: { id, schoolId },
        include: {
          academicYear: true,
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      });

      if (!schoolClass) {
        throw new NotFoundException(`Class with ID "${id}" was not found.`);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Class retrieved successfully.',
        data: schoolClass,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to retrieve class.');
    }
  }

  async update(
    id: string,
    schoolId: string,
    dto: UpdateClassDto,
  ): Promise<ClassFindOneResponseDto> {
    const {
      name,
      section,
      room,
      capacity,
      academicYearId,
      status,
      teacherId,
      assistantTeacherId,
      subjects,
    } = dto;

    try {
      if (name !== undefined && !name.trim()) {
        throw new BadRequestException('Class name is required.');
      }
      if (section !== undefined && !section.trim()) {
        throw new BadRequestException('Section is required.');
      }
      if (room !== undefined && !room.trim()) {
        throw new BadRequestException('Room is required.');
      }
      if (academicYearId !== undefined && !academicYearId.trim()) {
        throw new BadRequestException('Academic year is required.');
      }
      if (
        capacity !== undefined &&
        (!Number.isInteger(capacity) || capacity < 1)
      ) {
        throw new BadRequestException(
          'Capacity must be a positive whole number.',
        );
      }
      if (teacherId !== undefined && !teacherId.trim()) {
        throw new BadRequestException('Class teacher is required.');
      }

      if (academicYearId !== undefined) {
        const academicYear = await this.prisma.academicYear.findUnique({
          where: { id: academicYearId.trim(), schoolId },
          select: { id: true },
        });
        if (!academicYear) {
          throw new BadRequestException(
            'Select a valid academic year for this school.',
          );
        }
      }

      const current = await this.prisma.class.findUnique({
        where: { id, schoolId },
        include: {
          subjects: true,
        },
      });

      if (!current) {
        throw new NotFoundException(`Class with ID "${id}" was not found.`);
      }

      const nextTeacherId = teacherId?.trim() ?? current.teacherId;
      const nextAssistantTeacherId =
        assistantTeacherId === undefined
          ? current.assistantTeacherId
          : assistantTeacherId?.trim() || null;

      if (nextAssistantTeacherId && nextAssistantTeacherId === nextTeacherId) {
        throw new BadRequestException('Choose a different assistant teacher.');
      }

      const subjectRows =
        subjects !== undefined ? this.normalizeSubjects(subjects) : undefined;
      const availableTeacherIds = await this.findAvailableTeacherIds([
        nextTeacherId,
        ...(nextAssistantTeacherId ? [nextAssistantTeacherId] : []),
        ...(subjectRows?.map((row) => row.teacherId) ?? []),
      ]);
      const availableSubjectIds = await this.findAvailableSubjectIds(
        subjectRows?.map((row) => row.subjectId) ?? [],
        schoolId,
      );

      if (!availableTeacherIds.has(nextTeacherId)) {
        throw new BadRequestException('Select an available class teacher.');
      }
      if (
        nextAssistantTeacherId &&
        !availableTeacherIds.has(nextAssistantTeacherId)
      ) {
        throw new BadRequestException('Select an available assistant teacher.');
      }
      if (subjectRows?.some((row) => !availableTeacherIds.has(row.teacherId))) {
        throw new BadRequestException(
          'Select an available teacher for each subject.',
        );
      }
      if (subjectRows?.some((row) => !availableSubjectIds.has(row.subjectId))) {
        throw new BadRequestException(
          'Select an available subject for each row.',
        );
      }

      const schoolClass = await this.prisma.class.update({
        where: { id },
        data: {
          name: name?.trim(),
          section: section?.trim().toUpperCase(),
          room: room?.trim(),
          capacity,
          academicYearId: academicYearId?.trim(),
          status,
          teacherId: nextTeacherId,
          assistantTeacherId: nextAssistantTeacherId,
          ...(subjectRows !== undefined && {
            subjects: {
              deleteMany: {},
              create: subjectRows,
            },
          }),
        },
        include: {
          academicYear: true,
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Class updated successfully.',
        data: schoolClass,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A class with the same name, section and academic year already exists.',
        );
      }
      this.handlePrismaError(error, id);
    }
  }

  async remove(id: string, schoolId: string): Promise<void> {
    try {
      const schoolClass = await this.prisma.class.findUnique({
        where: { id, schoolId },
        select: { id: true },
      });

      if (!schoolClass) {
        throw new NotFoundException(`Class with ID "${id}" was not found.`);
      }

      await this.prisma.class.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Class with ID "${id}" was not found.`);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2003' || error.code === 'P2014')
      ) {
        throw new ConflictException('Class is linked to other records.');
      }
      this.handlePrismaError(error, id);
    }
  }

  private normalizeSubjects(subjects?: CreateClassSubjectDto[]): {
    subjectId: string;
    teacherId: string;
    periodsPerWeek: number;
  }[] {
    const rows: {
      subjectId: string;
      teacherId: string;
      periodsPerWeek: number;
    }[] = [];
    const selectedSubjects = new Set<string>();

    (subjects ?? []).forEach((row, index) => {
      const subjectId = row.subjectId?.trim();
      const teacherId = row.teacherId?.trim();

      if (!subjectId) {
        throw new BadRequestException(`Select a subject for row ${index + 1}.`);
      }
      if (!teacherId) {
        throw new BadRequestException(`Select a teacher for row ${index + 1}.`);
      }
      if (!Number.isInteger(row.periodsPerWeek) || row.periodsPerWeek < 1) {
        throw new BadRequestException(
          `Enter periods per week for row ${index + 1}.`,
        );
      }
      if (selectedSubjects.has(subjectId)) {
        throw new BadRequestException('This subject is already assigned.');
      }

      selectedSubjects.add(subjectId);
      rows.push({
        subjectId,
        teacherId,
        periodsPerWeek: row.periodsPerWeek,
      });
    });

    return rows;
  }

  private async findAvailableTeacherIds(
    teacherIds: string[],
  ): Promise<Set<string>> {
    const uniqueIds = [...new Set(teacherIds)];
    if (!uniqueIds.length) return new Set();

    const teachers = await this.prisma.teacher.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });

    return new Set(teachers.map((teacher) => teacher.id));
  }

  private async findAvailableSubjectIds(
    subjectIds: string[],
    schoolId: string,
  ): Promise<Set<string>> {
    const uniqueIds = [...new Set(subjectIds)];
    if (!uniqueIds.length) return new Set();

    const subjects = await this.prisma.subject.findMany({
      where: { id: { in: uniqueIds }, schoolId },
      select: { id: true },
    });

    return new Set(subjects.map((subject) => subject.id));
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof HttpException) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A class with the same name, section and academic year already exists.',
        );
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Invalid school, academic year, teacher, or subject ID for class.',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Class with ID "${id}" was not found.`);
      }
    }
    throw new InternalServerErrorException('Class operation failed.');
  }
}
