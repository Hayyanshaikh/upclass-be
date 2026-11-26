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
  LeaveRequestStatus,
  Prisma,
  TeacherAttendanceSource,
  TeacherAttendanceStatus,
} from '../../generated/prisma/client.ts';
import { PrismaService } from '../../database/prisma.service.ts';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto.ts';
import { FindLeaveRequestsQueryDto } from './dto/find-leave-requests-query.dto.ts';
import {
  ApproveLeaveRequestDto,
  RejectLeaveRequestDto,
} from './dto/review-leave-request.dto.ts';
import {
  LeaveBalanceResponseDto,
  LeaveRequestFindOneResponseDto,
  LeaveRequestsResponseDto,
} from './dto/leave-requests-response.dto.ts';

const teacherSelect = {
  id: true,
  firstName: true,
  lastName: true,
  employeeId: true,
} as const;

const leaveRequestInclude = {
  teacher: { select: teacherSelect },
  substituteTeacher: { select: teacherSelect },
  leavePolicy: { select: { id: true, name: true, daysPerYear: true } },
  attachments: { select: { id: true, name: true, url: true } },
} as const;

const MAX_REQUEST_DAYS = 365;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

type PendingLeaveRequest = {
  id: string;
  teacherId: string;
  fromDate: Date;
  toDate: Date;
  status: LeaveRequestStatus;
};

@Injectable()
export class LeaveRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateLeaveRequestDto,
    userId: string,
    schoolId: string,
  ): Promise<LeaveRequestFindOneResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const teacher = await this.resolveTeacher(userId, schoolId);
      const leavePolicy = await this.prisma.leavePolicy.findFirst({
        where: { id: dto.leavePolicyId, schoolId },
        select: { id: true, name: true, daysPerYear: true },
      });

      if (!leavePolicy) {
        throw new NotFoundException(
          `Leave policy with ID "${dto.leavePolicyId}" was not found.`,
        );
      }

      if (dto.substituteTeacherId) {
        if (dto.substituteTeacherId === teacher.id) {
          throw new BadRequestException(
            'Select a different substitute teacher.',
          );
        }

        const substitute = await this.prisma.teacher.findFirst({
          where: { id: dto.substituteTeacherId, schoolId },
          select: { id: true },
        });

        if (!substitute) {
          throw new NotFoundException(
            `Teacher with ID "${dto.substituteTeacherId}" was not found.`,
          );
        }
      }

      const fromDate = this.toDateOnly(dto.fromDate);
      const toDate = this.toDateOnly(dto.toDate);
      const isHalfDay = dto.isHalfDay ?? false;

      if (toDate.getTime() < fromDate.getTime()) {
        throw new BadRequestException(
          'To date must be on or after the from date.',
        );
      }

      if (isHalfDay && toDate.getTime() !== fromDate.getTime()) {
        throw new BadRequestException('Half day leave must be for one date.');
      }

      const totalDays = isHalfDay
        ? 0.5
        : this.daysBetween(fromDate, toDate);

      if (totalDays > MAX_REQUEST_DAYS) {
        throw new BadRequestException(
          `Leave request cannot exceed ${MAX_REQUEST_DAYS} days.`,
        );
      }

      const { start: yearStart, end: yearEnd } = this.yearRange(
        fromDate.getUTCFullYear(),
      );
      const consumed = await this.prisma.leaveRequest.aggregate({
        where: {
          schoolId,
          teacherId: teacher.id,
          leavePolicyId: leavePolicy.id,
          status: {
            in: [LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING],
          },
          fromDate: { gte: yearStart, lt: yearEnd },
        },
        _sum: { totalDays: true },
      });
      const remainingDays = Math.max(
        0,
        leavePolicy.daysPerYear - (consumed._sum.totalDays ?? 0),
      );

      if (remainingDays <= 0) {
        throw new BadRequestException(
          `No ${leavePolicy.name} balance is left for this year.`,
        );
      }

      if (totalDays > remainingDays) {
        throw new BadRequestException(
          `Insufficient ${leavePolicy.name} balance: ${remainingDays} day(s) left, but this request needs ${totalDays} day(s).`,
        );
      }

      const reason = dto.reason?.trim();

      if (!reason) {
        throw new BadRequestException('Reason is required.');
      }

      const request = await this.prisma.leaveRequest.create({
        data: {
          schoolId,
          teacherId: teacher.id,
          leavePolicyId: leavePolicy.id,
          substituteTeacherId: dto.substituteTeacherId ?? null,
          fromDate,
          toDate,
          totalDays,
          isHalfDay,
          reason,
          contactDuringLeave: dto.contactDuringLeave?.trim() || null,
          attachments: dto.attachments?.length
            ? {
                create: dto.attachments.map((attachment) => ({
                  name: attachment.name.trim(),
                  url: attachment.url.trim(),
                })),
              }
            : undefined,
        },
        include: leaveRequestInclude,
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Leave request submitted successfully.',
        data: request,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(
    query: FindLeaveRequestsQueryDto,
    schoolId: string,
  ): Promise<LeaveRequestsResponseDto> {
    this.ensureSchoolContext(schoolId);

    const {
      limit = 10,
      offset = 0,
      searchKey,
      leavePolicyId,
      status,
      month,
    } = query;

    const where: Prisma.LeaveRequestWhereInput = {
      schoolId,
      ...(leavePolicyId && { leavePolicyId }),
      ...(status && { status }),
      ...(month && { fromDate: this.monthRange(month) }),
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
        this.prisma.leaveRequest.findMany({
          where,
          include: leaveRequestInclude,
          take: limit,
          skip: offset,
          orderBy: [{ fromDate: 'desc' }, { createdAt: 'desc' }],
        }),
        this.prisma.leaveRequest.count({ where }),
      ]);

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave requests retrieved successfully.',
        data,
        total,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve leave requests.',
      );
    }
  }

  async findOne(
    id: string,
    schoolId: string,
  ): Promise<LeaveRequestFindOneResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const request = await this.prisma.leaveRequest.findUnique({
        where: { id, schoolId },
        include: leaveRequestInclude,
      });

      if (!request) {
        throw new NotFoundException(
          `Leave request with ID "${id}" was not found.`,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave request retrieved successfully.',
        data: request,
        balanceAfterApproval: await this.balanceAfterApproval(request),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async approve(
    id: string,
    dto: ApproveLeaveRequestDto,
    userId: string,
    schoolId: string,
  ): Promise<LeaveRequestFindOneResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const current = await this.findPending(id, schoolId, 'approved');

      const updated = await this.prisma.$transaction(async (tx) => {
        const request = await tx.leaveRequest.update({
          where: { id },
          data: {
            status: LeaveRequestStatus.APPROVED,
            rejectionReason: null,
            reviewComment: dto.comment?.trim() || null,
            reviewedByUserId: userId,
            reviewedAt: new Date(),
          },
          include: leaveRequestInclude,
        });

        for (const date of this.enumerateDates(current.fromDate, current.toDate)) {
          await tx.teacherAttendance.upsert({
            where: {
              teacherId_date: { teacherId: current.teacherId, date },
            },
            update: {
              status: TeacherAttendanceStatus.LEAVE,
              source: TeacherAttendanceSource.LEAVE_REQUEST,
              checkIn: null,
              checkOut: null,
              lateMinutes: null,
              remarks: 'Approved leave request',
            },
            create: {
              schoolId,
              teacherId: current.teacherId,
              date,
              status: TeacherAttendanceStatus.LEAVE,
              source: TeacherAttendanceSource.LEAVE_REQUEST,
              remarks: 'Approved leave request',
            },
          });
        }

        return request;
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave request approved successfully.',
        data: updated,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async reject(
    id: string,
    dto: RejectLeaveRequestDto,
    userId: string,
    schoolId: string,
  ): Promise<LeaveRequestFindOneResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const reason = dto.reason?.trim();

      if (!reason) {
        throw new BadRequestException('Rejection reason is required.');
      }

      await this.findPending(id, schoolId, 'rejected');

      const request = await this.prisma.leaveRequest.update({
        where: { id },
        data: {
          status: LeaveRequestStatus.REJECTED,
          rejectionReason: reason,
          reviewComment: null,
          reviewedByUserId: userId,
          reviewedAt: new Date(),
        },
        include: leaveRequestInclude,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave request rejected successfully.',
        data: request,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async cancel(
    id: string,
    userId: string,
    schoolId: string,
  ): Promise<LeaveRequestFindOneResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      await this.findPending(id, schoolId, 'cancelled');

      const request = await this.prisma.leaveRequest.update({
        where: { id },
        data: {
          status: LeaveRequestStatus.CANCELLED,
          reviewedByUserId: userId,
          reviewedAt: new Date(),
        },
        include: leaveRequestInclude,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave request cancelled successfully.',
        data: request,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async cancelMy(
    id: string,
    userId: string,
    schoolId: string,
  ): Promise<LeaveRequestFindOneResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const teacher = await this.resolveTeacher(userId, schoolId);
      const current = await this.prisma.leaveRequest.findFirst({
        where: { id, schoolId, teacherId: teacher.id },
        select: { id: true, status: true },
      });

      if (!current) {
        throw new NotFoundException(
          `Leave request with ID "${id}" was not found.`,
        );
      }

      if (current.status !== LeaveRequestStatus.PENDING) {
        throw new ConflictException(
          'Only pending leave requests can be cancelled.',
        );
      }

      const request = await this.prisma.leaveRequest.update({
        where: { id },
        data: {
          status: LeaveRequestStatus.CANCELLED,
          reviewedByUserId: userId,
          reviewedAt: new Date(),
        },
        include: leaveRequestInclude,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave request cancelled successfully.',
        data: request,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async myRequests(
    userId: string,
    schoolId: string,
  ): Promise<LeaveRequestsResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const teacher = await this.resolveTeacher(userId, schoolId);
      const data = await this.prisma.leaveRequest.findMany({
        where: { schoolId, teacherId: teacher.id },
        include: leaveRequestInclude,
        orderBy: [{ fromDate: 'desc' }, { createdAt: 'desc' }],
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave requests retrieved successfully.',
        data,
        total: data.length,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async myBalance(
    userId: string,
    schoolId: string,
  ): Promise<LeaveBalanceResponseDto> {
    this.ensureSchoolContext(schoolId);

    try {
      const teacher = await this.resolveTeacher(userId, schoolId);
      const { start, end } = this.yearRange(new Date().getUTCFullYear());

      const [policies, committed] = await Promise.all([
        this.prisma.leavePolicy.findMany({
          where: { schoolId },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, daysPerYear: true },
        }),
        this.prisma.leaveRequest.groupBy({
          by: ['leavePolicyId'],
          where: {
            schoolId,
            teacherId: teacher.id,
            leavePolicyId: { not: null },
            status: {
              in: [LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING],
            },
            fromDate: { gte: start, lt: end },
          },
          _sum: { totalDays: true },
        }),
      ]);

      const usedByPolicy = new Map<string, number>();

      for (const row of committed) {
        if (row.leavePolicyId) {
          usedByPolicy.set(row.leavePolicyId, row._sum.totalDays ?? 0);
        }
      }

      const data = policies.map((policy) => {
        const usedDays = usedByPolicy.get(policy.id) ?? 0;

        return {
          leavePolicyId: policy.id,
          leaveType: policy.name,
          daysPerYear: policy.daysPerYear,
          usedDays,
          remainingDays: Math.max(0, policy.daysPerYear - usedDays),
        };
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Leave balances retrieved successfully.',
        data,
        total: data.length,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async findPending(
    id: string,
    schoolId: string,
    action: string,
  ): Promise<PendingLeaveRequest> {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id, schoolId },
      select: {
        id: true,
        teacherId: true,
        fromDate: true,
        toDate: true,
        status: true,
      },
    });

    if (!request) {
      throw new NotFoundException(
        `Leave request with ID "${id}" was not found.`,
      );
    }

    if (request.status !== LeaveRequestStatus.PENDING) {
      throw new ConflictException(
        `Only pending leave requests can be ${action}.`,
      );
    }

    return request;
  }

  private async balanceAfterApproval(request: {
    teacherId: string;
    leavePolicyId: string | null;
    fromDate: Date;
    leavePolicy: { daysPerYear: number } | null;
  }): Promise<number | null> {
    if (!request.leavePolicyId || !request.leavePolicy) {
      return null;
    }

    const year = request.fromDate.getUTCFullYear();
    const { start, end } = this.yearRange(year);
    const aggregate = await this.prisma.leaveRequest.aggregate({
      where: {
        teacherId: request.teacherId,
        leavePolicyId: request.leavePolicyId,
        status: {
          in: [LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING],
        },
        fromDate: { gte: start, lt: end },
      },
      _sum: { totalDays: true },
    });
    const consumedDays = aggregate._sum.totalDays ?? 0;

    return Math.max(0, request.leavePolicy.daysPerYear - consumedDays);
  }

  private ensureSchoolContext(schoolId: string): void {
    if (!schoolId?.trim()) {
      throw new BadRequestException('School context is required.');
    }
  }

  private async resolveTeacher(
    userId: string,
    schoolId: string,
  ): Promise<{
    id: string;
    firstName: string;
    lastName: string | null;
    employeeId: string | null;
  }> {
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

  private daysBetween(fromDate: Date, toDate: Date): number {
    return (
      Math.floor(
        (toDate.getTime() - fromDate.getTime()) / MILLISECONDS_PER_DAY,
      ) + 1
    );
  }

  private enumerateDates(fromDate: Date, toDate: Date): Date[] {
    const dates: Date[] = [];
    const cursor = new Date(fromDate);

    while (cursor.getTime() <= toDate.getTime()) {
      dates.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return dates;
  }

  private monthRange(month: string): { gte: Date; lt: Date } {
    const [year, monthIndex] = month.split('-').map(Number);

    return {
      gte: new Date(Date.UTC(year, monthIndex - 1, 1)),
      lt: new Date(Date.UTC(year, monthIndex, 1)),
    };
  }

  private yearRange(year: number): { start: Date; end: Date } {
    return {
      start: new Date(Date.UTC(year, 0, 1)),
      end: new Date(Date.UTC(year + 1, 0, 1)),
    };
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) throw error;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'One of the selected records is no longer available.',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Leave request was not found.');
      }
    }

    throw new InternalServerErrorException('Leave request operation failed.');
  }
}
