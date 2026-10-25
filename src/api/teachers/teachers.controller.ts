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

import { TeachersService } from './teachers.service.ts';
import { CreateTeacherDto } from './dto/create-teacher.dto.ts';
import { UpdateTeacherDto } from './dto/update-teacher.dto.ts';
import { FindTeachersQueryDto } from './dto/find-teachers-query.dto.ts';
import {
  TeacherFindOneResponseDto,
  TeacherResponseDto,
} from './dto/teachers-response.dto.ts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.ts';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.ts';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a teacher' })
  @ApiCreatedResponse({
    description: 'Teacher created successfully',
    type: TeacherFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Teacher already exists' })
  create(
    @Body() createTeacherDto: CreateTeacherDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TeacherFindOneResponseDto> {
    return this.teachersService.create(createTeacherDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiOkResponse({
    description: 'Teachers retrieved successfully',
    type: TeacherResponseDto,
  })
  findAll(@Query() query: FindTeachersQueryDto): Promise<TeacherResponseDto> {
    return this.teachersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a teacher by ID' })
  @ApiOkResponse({
    description: 'Teacher retrieved successfully',
    type: TeacherFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  findOne(@Param('id') id: string): Promise<TeacherFindOneResponseDto> {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a teacher' })
  @ApiOkResponse({
    description: 'Teacher updated successfully',
    type: TeacherFindOneResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @ApiResponse({ status: 409, description: 'Teacher already exists' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
  ): Promise<TeacherFindOneResponseDto> {
    return this.teachersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a teacher and linked user' })
  @ApiOkResponse({
    description: 'Teacher and linked user deleted successfully',
    type: TeacherFindOneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  remove(@Param('id') id: string): Promise<TeacherFindOneResponseDto> {
    return this.teachersService.remove(id);
  }
}
