import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { LeaveRequestsService } from './leave-requests.service.ts';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import {
  LEAVE_REQUEST_PERMISSIONS,
  TEACHER_LEAVE_PERMISSIONS,
} from './entities/leave-request.permission.ts';

@ApiTags('Leave Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Permissions(TEACHER_LEAVE_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Submit a leave request for the current teacher' })
  @ApiCreatedResponse({
    description: 'Leave request submitted successfully',
    type: LeaveRequestFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Teacher profile or leave policy not found' })
  create(
    @Body() dto: CreateLeaveRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeaveRequestFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leaveRequestsService.create(dto, req.user.id, schoolId);
  }

  @Permissions(LEAVE_REQUEST_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List leave requests for the school' })
  @ApiOkResponse({
    description: 'Leave requests retrieved successfully',
    type: LeaveRequestsResponseDto,
  })
  findAll(
    @Query() query: FindLeaveRequestsQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeaveRequestsResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leaveRequestsService.findAll(query, schoolId);
  }

  @Permissions(TEACHER_LEAVE_PERMISSIONS.VIEW)
  @Get('my')
  @ApiOperation({ summary: 'List leave requests of the current teacher' })
  @ApiOkResponse({
    description: 'Leave requests retrieved successfully',
    type: LeaveRequestsResponseDto,
  })
  myRequests(
    @Req() req: AuthenticatedRequest,
  ): Promise<LeaveRequestsResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leaveRequestsService.myRequests(req.user.id, schoolId);
  }

  @Permissions(TEACHER_LEAVE_PERMISSIONS.VIEW)
  @Get('my/balance')
  @ApiOperation({ summary: 'Get leave balances of the current teacher' })
  @ApiOkResponse({
    description: 'Leave balances retrieved successfully',
    type: LeaveBalanceResponseDto,
  })
  myBalance(
    @Req() req: AuthenticatedRequest,
  ): Promise<LeaveBalanceResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leaveRequestsService.myBalance(req.user.id, schoolId);
  }

  @Permissions(LEAVE_REQUEST_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get a leave request by ID' })
  @ApiOkResponse({
    description: 'Leave request retrieved successfully',
    type: LeaveRequestFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeaveRequestFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leaveRequestsService.findOne(id, schoolId);
  }

  @Permissions(LEAVE_REQUEST_PERMISSIONS.EDIT)
  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve a pending leave request and mark attendance as leave',
  })
  @ApiOkResponse({
    description: 'Leave request approved successfully',
    type: LeaveRequestFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({ status: 409, description: 'Leave request is not pending' })
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveLeaveRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeaveRequestFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leaveRequestsService.approve(id, dto, req.user.id, schoolId);
  }

  @Permissions(LEAVE_REQUEST_PERMISSIONS.EDIT)
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a pending leave request' })
  @ApiOkResponse({
    description: 'Leave request rejected successfully',
    type: LeaveRequestFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({ status: 409, description: 'Leave request is not pending' })
  reject(
    @Param('id') id: string,
    @Body() dto: RejectLeaveRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeaveRequestFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leaveRequestsService.reject(id, dto, req.user.id, schoolId);
  }

  @Permissions(LEAVE_REQUEST_PERMISSIONS.EDIT)
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending leave request' })
  @ApiOkResponse({
    description: 'Leave request cancelled successfully',
    type: LeaveRequestFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({ status: 409, description: 'Leave request is not pending' })
  cancel(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeaveRequestFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leaveRequestsService.cancel(id, req.user.id, schoolId);
  }

  @Permissions(TEACHER_LEAVE_PERMISSIONS.EDIT)
  @Patch('my/:id/cancel')
  @ApiOperation({ summary: 'Cancel a pending leave request of the current teacher' })
  @ApiOkResponse({
    description: 'Leave request cancelled successfully',
    type: LeaveRequestFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({ status: 409, description: 'Leave request is not pending' })
  cancelMy(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<LeaveRequestFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.leaveRequestsService.cancelMy(id, req.user.id, schoolId);
  }
}
