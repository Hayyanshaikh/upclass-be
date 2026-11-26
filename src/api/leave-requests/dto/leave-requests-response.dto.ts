import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveRequestStatus } from '../../../generated/prisma/client.ts';

export class LeaveRequestTeacherDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ type: String, nullable: true })
  lastName: string | null;

  @ApiProperty({ type: String, nullable: true })
  employeeId: string | null;
}

export class LeaveRequestPolicyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  daysPerYear: number;
}

export class LeaveRequestAttachmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;
}

export class LeaveRequestDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  schoolId: string;

  @ApiProperty()
  teacherId: string;

  @ApiProperty({ type: String, nullable: true })
  leavePolicyId: string | null;

  @ApiProperty({ type: String, nullable: true })
  substituteTeacherId: string | null;

  @ApiProperty({ type: Date })
  fromDate: Date;

  @ApiProperty({ type: Date })
  toDate: Date;

  @ApiProperty()
  totalDays: number;

  @ApiProperty()
  isHalfDay: boolean;

  @ApiProperty()
  reason: string;

  @ApiProperty({ type: String, nullable: true })
  contactDuringLeave: string | null;

  @ApiProperty({ enum: LeaveRequestStatus })
  status: LeaveRequestStatus;

  @ApiProperty({ type: String, nullable: true })
  rejectionReason: string | null;

  @ApiProperty({ type: String, nullable: true })
  reviewComment: string | null;

  @ApiProperty({ type: String, nullable: true })
  reviewedByUserId: string | null;

  @ApiProperty({ type: Date, nullable: true })
  reviewedAt: Date | null;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiPropertyOptional({ type: LeaveRequestTeacherDto })
  teacher?: LeaveRequestTeacherDto;

  @ApiPropertyOptional({ type: LeaveRequestTeacherDto, nullable: true })
  substituteTeacher?: LeaveRequestTeacherDto | null;

  @ApiPropertyOptional({ type: LeaveRequestPolicyDto, nullable: true })
  leavePolicy?: LeaveRequestPolicyDto | null;

  @ApiPropertyOptional({ type: [LeaveRequestAttachmentDto] })
  attachments?: LeaveRequestAttachmentDto[];
}

export class LeaveRequestsResponseDto {
  @ApiProperty({ type: [LeaveRequestDto] })
  data: LeaveRequestDto[];

  @ApiProperty({ description: 'Total leave requests matching the filters' })
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiPropertyOptional()
  warning?: string;
}

export class LeaveRequestFindOneResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: LeaveRequestDto })
  data: LeaveRequestDto;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description:
      'Balance days remaining for the leave policy after this request is approved',
  })
  balanceAfterApproval?: number | null;
}

export class LeaveBalanceItemDto {
  @ApiProperty()
  leavePolicyId: string;

  @ApiProperty()
  leaveType: string;

  @ApiProperty()
  daysPerYear: number;

  @ApiProperty()
  usedDays: number;

  @ApiProperty()
  remainingDays: number;
}

export class LeaveBalanceResponseDto {
  @ApiProperty({ type: [LeaveBalanceItemDto] })
  data: LeaveBalanceItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;
}
