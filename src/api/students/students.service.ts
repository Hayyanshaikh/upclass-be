import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { CloudinaryService } from '../cloudinary/cloudinary.service.ts';
import { CreateStudentDto } from './dto/create-student.dto.ts';
import { UpdateStudentDto } from './dto/update-student.dto.ts';
import { FindStudentsQueryDto } from './dto/find-students-query.dto.ts';
import {
  StudentFindOneResponseDto,
  StudentResponseDto,
} from './dto/students-response.dto.ts';
import { LookupResponseDto } from '../../common/dto/lookup-response.dto.ts';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    dto: CreateStudentDto,
    schoolId: string,
  ): Promise<StudentFindOneResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const firstName = dto.firstName?.trim();
      const lastName = dto.lastName?.trim();
      const roll = dto.roll?.trim();
      const guardian = dto.guardian?.trim();
      const relation = dto.relation?.trim();
      const phone = dto.phone?.trim();
      const classId = dto.classId?.trim();

      if (!firstName) {
        throw new BadRequestException('First name is required.');
      }
      if (!lastName) {
        throw new BadRequestException('Last name is required.');
      }
      if (!classId) {
        throw new BadRequestException('Class is required.');
      }
      if (!roll) {
        throw new BadRequestException('Roll number is required.');
      }
      if (!guardian) {
        throw new BadRequestException('Guardian name is required.');
      }
      if (!relation) {
        throw new BadRequestException('Relation is required.');
      }
      if (!phone) {
        throw new BadRequestException('Phone is required.');
      }

      const classroom = await this.prisma.class.findUnique({
        where: { id: classId, schoolId },
        select: { id: true },
      });
      if (!classroom) {
        throw new BadRequestException('Select a valid class for this school.');
      }

      const student = await this.prisma.student.create({
        data: {
          schoolId,
          firstName,
          lastName,
          dateOfBirth: dto.dateOfBirth,
          gender: dto.gender,
          identityNumber: dto.identityNumber,
          bloodGroup: dto.bloodGroup,
          classId: classroom.id,
          roll,
          admissionDate: dto.admissionDate,
          status: dto.status,
          guardian,
          relation,
          phone,
          email: dto.email,
          address: dto.address,
          photo: dto.photo,
        },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Student created successfully.',
        data: student,
      };
    } catch (error) {
      if (dto.photo) {
        await this.cloudinary.deleteImageSafely(
          this.cloudinary.extractPublicIdFromImageUrl(dto.photo),
        );
      }
      this.handlePrismaError(error);
    }
  }

  async findAll(
    query: FindStudentsQueryDto,
    schoolId: string,
  ): Promise<StudentResponseDto> {
    if (!schoolId?.trim()) {
      throw new BadRequestException('School context is required.');
    }

    const { limit = 10, offset = 0, searchKey, classId, status } = query;
    const where: Prisma.StudentWhereInput = {
      schoolId,
      ...(searchKey && {
        OR: [
          { firstName: { contains: searchKey, mode: 'insensitive' } },
          { lastName: { contains: searchKey, mode: 'insensitive' } },
          { roll: { contains: searchKey, mode: 'insensitive' } },
          { identityNumber: { contains: searchKey, mode: 'insensitive' } },
          { guardian: { contains: searchKey, mode: 'insensitive' } },
        ],
      }),
      ...(classId && { classId }),
      ...(status && { status }),
    };

    try {
      const [data, total] = await Promise.all([
        this.prisma.student.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        }),
        this.prisma.student.count({ where }),
      ]);

      return {
        data,
        total,
        message: 'Students retrieved successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve students.');
    }
  }

  async lookup(schoolId: string): Promise<LookupResponseDto> {
    if (!schoolId?.trim()) {
      throw new BadRequestException('School context is required.');
    }

    const studentData = await this.prisma.student.findMany({
      where: {
        schoolId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        roll: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    const students = studentData.map((student) => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`.trim(),
      code: student.roll,
    }));

    return {
      data: students,
      total: students.length,
      message: 'Students options retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  async findOne(
    id: string,
    schoolId: string,
  ): Promise<StudentFindOneResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const student = await this.prisma.student.findUnique({
        where: { id, schoolId },
      });
      if (!student) throw new NotFoundException('Student not found.');

      return {
        statusCode: HttpStatus.OK,
        message: 'Student retrieved successfully.',
        data: student,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to retrieve student.');
    }
  }

  async update(
    id: string,
    schoolId: string,
    dto: UpdateStudentDto,
  ): Promise<StudentFindOneResponseDto> {
    let currentPhoto: string | null | undefined;

    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      if (dto.firstName !== undefined && !dto.firstName?.trim()) {
        throw new BadRequestException('First name is required.');
      }
      if (dto.lastName !== undefined && !dto.lastName?.trim()) {
        throw new BadRequestException('Last name is required.');
      }
      if (dto.classId !== undefined && !dto.classId?.trim()) {
        throw new BadRequestException('Class is required.');
      }
      if (dto.roll !== undefined && !dto.roll?.trim()) {
        throw new BadRequestException('Roll number is required.');
      }
      if (dto.guardian !== undefined && !dto.guardian?.trim()) {
        throw new BadRequestException('Guardian name is required.');
      }
      if (dto.relation !== undefined && !dto.relation?.trim()) {
        throw new BadRequestException('Relation is required.');
      }
      if (dto.phone !== undefined && !dto.phone?.trim()) {
        throw new BadRequestException('Phone is required.');
      }

      const existing = await this.prisma.student.findUnique({
        where: { id, schoolId },
        select: { id: true, photo: true },
      });
      if (!existing) {
        throw new NotFoundException(`Student with ID "${id}" was not found.`);
      }
      currentPhoto = existing.photo;

      if (dto.classId !== undefined) {
        const classroom = await this.prisma.class.findUnique({
          where: { id: dto.classId.trim(), schoolId },
          select: { id: true },
        });
        if (!classroom) {
          throw new BadRequestException(
            'Select a valid class for this school.',
          );
        }
      }

      const student = await this.prisma.student.update({
        where: { id },
        data: {
          ...(dto.firstName !== undefined && {
            firstName: dto.firstName.trim(),
          }),
          ...(dto.lastName !== undefined && {
            lastName: dto.lastName.trim(),
          }),
          ...(dto.dateOfBirth !== undefined && {
            dateOfBirth: dto.dateOfBirth,
          }),
          ...(dto.gender !== undefined && { gender: dto.gender }),
          ...(dto.identityNumber !== undefined && {
            identityNumber: dto.identityNumber,
          }),
          ...(dto.bloodGroup !== undefined && {
            bloodGroup: dto.bloodGroup,
          }),
          ...(dto.classId !== undefined && {
            classId: dto.classId.trim(),
          }),
          ...(dto.roll !== undefined && { roll: dto.roll.trim() }),
          ...(dto.admissionDate !== undefined && {
            admissionDate: dto.admissionDate,
          }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.guardian !== undefined && {
            guardian: dto.guardian.trim(),
          }),
          ...(dto.relation !== undefined && {
            relation: dto.relation.trim(),
          }),
          ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.address !== undefined && { address: dto.address }),
          ...(dto.photo !== undefined && { photo: dto.photo }),
        },
      });

      if (dto.photo !== undefined && dto.photo !== existing.photo) {
        await this.cloudinary.deleteImageSafely(
          this.cloudinary.extractPublicIdFromImageUrl(existing.photo),
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Student updated successfully.',
        data: student,
      };
    } catch (error) {
      if (dto.photo !== undefined && dto.photo !== currentPhoto) {
        await this.cloudinary.deleteImageSafely(
          this.cloudinary.extractPublicIdFromImageUrl(dto.photo),
        );
      }
      this.handlePrismaError(error, id);
    }
  }

  async remove(
    id: string,
    schoolId: string,
  ): Promise<StudentFindOneResponseDto> {
    try {
      if (!schoolId?.trim()) {
        throw new BadRequestException('School context is required.');
      }

      const student = await this.prisma.student.findUnique({
        where: { id, schoolId },
      });
      if (!student) {
        throw new NotFoundException(`Student with ID "${id}" was not found.`);
      }

      await this.prisma.student.delete({
        where: { id },
      });

      await this.cloudinary.deleteImageSafely(
        this.cloudinary.extractPublicIdFromImageUrl(student.photo),
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Student deleted successfully.',
        data: student,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2003' || error.code === 'P2014')
      ) {
        throw new ConflictException('Student is linked to other records.');
      }
      this.handlePrismaError(error, id);
    }
  }

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof HttpException) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A student with this roll number already exists in this school.',
        );
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Invalid school or class ID for student.',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Student with ID "${id}" was not found.`);
      }
    }
    throw new InternalServerErrorException('Student operation failed.');
  }
}
