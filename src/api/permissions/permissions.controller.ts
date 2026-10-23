import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service.ts';
import {
  PermissionResponseDto,
  PermissionsResponseDto,
} from './dto/permission-response.dto.ts';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get the seeded permission catalog' })
  @ApiOkResponse({ type: PermissionsResponseDto })
  findAll(): Promise<PermissionsResponseDto> {
    return this.permissionsService.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a permission by key' })
  @ApiOkResponse({ type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  findOne(@Param('key') key: string): Promise<PermissionResponseDto> {
    return this.permissionsService.findOne(key);
  }
}
