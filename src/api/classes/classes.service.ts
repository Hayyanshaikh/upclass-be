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
import { CreateClassDto } from './dto/create-class.dto.ts';
import { CreateClassSectionDto } from './dto/create-class-section.dto.ts';
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

  private readonly classInclude = {
    academicYear: true,
    sections: {
      include: { section: true },
      orderBy: { section: { name: 'asc' } },
    },
  } satisfies Prisma.ClassInclude;

  async create(
    dto: CreateClassDto,
    schoolId: string,
  ): Promise<ClassFindOneResponseDto> {
    const { name, academicYearId, status, sections } = dto;

    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }
      if (!name?.trim()) {
        throw new BadRequestException('Class name is required.');
      }
      if (!academicYearId?.trim()) {
        throw new BadRequestException('Academic year is required.');
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

      const normalizedSections = await this.validateSections(
        sections,
        schoolId,
      );

      const schoolClass = await this.prisma.class.create({
        data: {
          schoolId,
          name: name.trim(),
          academicYearId: academicYear.id,
          status,
          sections: {
            create: normalizedSections,
          },
        },
        include: this.classInclude,
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
          'A class with the same name and academic year already exists.',
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
      ...(teacher && { sections: { some: { teacherId: teacher } } }),
      ...(status && { status }),
      ...(searchKey && {
        OR: [
          { name: { contains: searchKey, mode: 'insensitive' } },
          {
            sections: {
              some: {
                OR: [
                  { room: { contains: searchKey, mode: 'insensitive' } },
                  {
                    section: {
                      name: { contains: searchKey, mode: 'insensitive' },
                    },
                  },
                  {
                    teacher: {
                      firstName: { contains: searchKey, mode: 'insensitive' },
                    },
                  },
                  {
                    teacher: {
                      lastName: { contains: searchKey, mode: 'insensitive' },
                    },
                  },
                ],
              },
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
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          include: this.classInclude,
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
        include: this.classInclude,
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
    const { name, academicYearId, status, sections } = dto;

    try {
      if (name !== undefined && !name.trim()) {
        throw new BadRequestException('Class name is required.');
      }
      if (academicYearId !== undefined && !academicYearId.trim()) {
        throw new BadRequestException('Academic year is required.');
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
        select: { id: true },
      });

      if (!current) {
        throw new NotFoundException(`Class with ID "${id}" was not found.`);
      }

      const normalizedSections =
        sections !== undefined
          ? await this.validateSections(sections, schoolId)
          : undefined;

      const schoolClass = await this.prisma.class.update({
        where: { id },
        data: {
          name: name?.trim(),
          academicYearId: academicYearId?.trim(),
          status,
          ...(normalizedSections && {
            sections: {
              deleteMany: {},
              create: normalizedSections,
            },
          }),
        },
        include: this.classInclude,
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
          'A class with the same name and academic year already exists.',
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

  private async validateSections(
    sections: CreateClassSectionDto[],
    schoolId: string,
  ): Promise<
    {
      sectionId: string;
      teacherId: string;
      room: string | null;
      capacity: number | null;
    }[]
  > {
    if (!sections?.length) {
      throw new BadRequestException('Add at least one section.');
    }
    if (sections.some((section) => !section.sectionId?.trim())) {
      throw new BadRequestException('Select a section for every row.');
    }
    if (sections.some((section) => !section.teacherId?.trim())) {
      throw new BadRequestException('Select a class teacher for every section.');
    }
    if (
      sections.some(
        (section) =>
          section.capacity != null &&
          (!Number.isInteger(section.capacity) || section.capacity < 1),
      )
    ) {
      throw new BadRequestException('Capacity must be a positive whole number.');
    }

    const sectionIds = sections.map((section) => section.sectionId.trim());
    if (new Set(sectionIds).size !== sectionIds.length) {
      throw new BadRequestException('Each section can only be added once.');
    }

    const teacherIds = [
      ...new Set(sections.map((section) => section.teacherId.trim())),
    ];

    const [availableSections, availableTeachers] = await Promise.all([
      this.prisma.section.findMany({
        where: { id: { in: sectionIds }, schoolId },
        select: { id: true },
      }),
      this.prisma.teacher.findMany({
        where: { id: { in: teacherIds } },
        select: { id: true },
      }),
    ]);

    if (availableSections.length !== sectionIds.length) {
      throw new BadRequestException(
        'Select valid sections for this school.',
      );
    }

    const availableTeacherIds = new Set(
      availableTeachers.map((teacher) => teacher.id),
    );
    if (teacherIds.some((teacherId) => !availableTeacherIds.has(teacherId))) {
      throw new BadRequestException('Select an available class teacher.');
    }

    return sections.map((section) => ({
      sectionId: section.sectionId.trim(),
      teacherId: section.teacherId.trim(),
      room: section.room?.trim() || null,
      capacity: section.capacity ?? null,
    }));
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof HttpException) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A class with the same name and academic year already exists.',
        );
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Invalid school, academic year, section, or teacher ID for class.',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Class with ID "${id}" was not found.`);
      }
    }
    throw new InternalServerErrorException('Class operation failed.');
  }
}
