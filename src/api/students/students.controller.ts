import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { StudentsService } from './students.service.ts';
import { CreateStudentDto } from './dto/create-student.dto.ts';
import { UpdateStudentDto } from './dto/update-student.dto.ts';
import { FindStudentsQueryDto } from './dto/find-students-query.dto.ts';
import {
  StudentFindOneResponseDto,
  StudentResponseDto,
} from './dto/students-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { STUDENT_PERMISSIONS } from './entities/student.permission.ts';
import { LookupResponseDto } from '../../common/dto/lookup-response.dto.ts';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Permissions(STUDENT_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Create a student' })
  @ApiCreatedResponse({
    description: 'Student created successfully',
    type: StudentFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Roll number already exists' })
  create(
    @Body() createStudentDto: CreateStudentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<StudentFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.studentsService.create(createStudentDto, schoolId);
  }

  @Permissions(STUDENT_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'Get all students' })
  @ApiOkResponse({
    description: 'Students retrieved successfully',
    type: StudentResponseDto,
  })
  findAll(
    @Query() query: FindStudentsQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<StudentResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.studentsService.findAll(query, schoolId);
  }

  @Get('lookup')
  @Permissions(STUDENT_PERMISSIONS.LOOKUP)
  @ApiOperation({ summary: 'Get students for dropdown' })
  @ApiOkResponse({ type: LookupResponseDto })
  lookup(@Req() req: AuthenticatedRequest) {
    const schoolId = req.headers['schoolid'] as string;
    return this.studentsService.lookup(schoolId);
  }

  @Permissions(STUDENT_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiOkResponse({
    description: 'Student retrieved successfully',
    type: StudentFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<StudentFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.studentsService.findOne(id, schoolId);
  }

  @Permissions(STUDENT_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a student' })
  @ApiOkResponse({
    description: 'Student updated successfully',
    type: StudentFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 409, description: 'Roll number already exists' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<StudentFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.studentsService.update(id, schoolId, dto);
  }

  @Permissions(STUDENT_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a student' })
  @ApiOkResponse({
    description: 'Student deleted successfully',
    type: StudentFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<StudentFindOneResponseDto> {
    const schoolId = req.headers['schoolid'] as string;
    return this.studentsService.remove(id, schoolId);
  }
}
