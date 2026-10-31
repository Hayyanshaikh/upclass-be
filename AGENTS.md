# AGENTS - NestJS Coding Conventions

This document outlines the coding conventions and patterns used in this NestJS project. Follow these conventions when creating new modules or APIs to maintain consistency.

## Module, Controller and Service Structure

### Module Organization
```typescript
// modules are organized in: backend/src/api/<feature>/<feature>.module.ts
import { Module } from '@nestjs/common';
import { Controller, Service, OtherModule } from '../';

@Module({
  imports: [OtherModule],
  controllers: [Controller],
  providers: [Service, GuardClass],
  exports: [Service], // only services that other modules need
})
export class <Feature>Module {}
```

### Controller Pattern
```typescript
@Controller('<resource>')
export class <Resource>Controller {
  constructor(private readonly <resource>Service: <ResourceService>) {}

  @Permissions(PERMISSIONS.CREATE)
  @Post()
  create(@Body() dto: Create<Resource>Dto): Promise<Create<Resource>Response> {
    return this.<resource>Service.create(dto);
  }

  @Permissions(PERMISSIONS.VIEW)
  @Get()
  findAll(@Query() query: Find<Resource>QueryDto): Promise<ResourceListDto> {
    return this.<resource>Service.findAll(query);
  }

  @Permissions(PERMISSIONS.VIEW)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<FindOne<Resource>Response> {
    return this.<resource>Service.findOne(id);
  }

  @Permissions(PERMISSIONS.EDIT)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Update<Resource>Dto): Promise<Update<Resource>Response> {
    return this.<resource>Service.update(id, dto);
  }

  @Permissions(PERMISSIONS.DELETE)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.<resource>Service.remove(id);
  }
}
```

### Service Pattern
```typescript
@Injectable()
export class <ResourceService> {
  constructor(
    private readonly prisma: PrismaService,
    // Other dependencies
  ) {}

  async create(dto: Create<Resource>Dto): Promise<Create<Resource>Response> {
    try {
      // Validation logic
      // Business logic
      // Database operations
      return {
        statusCode: HttpStatus.CREATED,
        message: '<Resource> created successfully',
        data: result,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('<Resource> already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('<Resource> not found');
      }
    }
    throw new InternalServerErrorException('<Resource> operation failed');
  }
}
```

## API Creation Patterns

### Dependencies
- `@nestjs/common` for core decorators
- `@nestjs/swagger` for API documentation
- `class-validator` and `class-transformer` for DTO validation
- `reflect-metadata` for decorators

### Validation
- DTOs use class-validator decorators (@IsString(), @IsEmail(), etc.)
- API responses are typed with @ApiProperty decorators
- Validation error messages are user-friendly and descriptive

### Error Handling
- Custom HttpExceptionFilter for consistent error responses
- HTTP exceptions provide structured error responses with status codes
- Prisma errors are caught and converted to appropriate HTTP exceptions

## DTOs and Validation Rules

### Create DTO Pattern
```typescript
export class Create<Resource>Dto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  // Add more fields as needed
}
```

### Response DTO Pattern
```typescript
export class <Resource>ResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: <Resource>DataDto })
  data: <Resource>DataDto;

  @ApiPropertyOptional()
  warning?: string;
}
```

### Query DTO Pattern
```typescript
export class Find<Resource>QueryDto {
  @ApiPropertyOptional({ type: Number, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchKey?: string;
}
```

## Database Schema Conventions

- Prisma types are imported from generated files: `../../generated/prisma/client.ts`
- Enums are imported from generated files: `../../generated/prisma/enums.ts`
- All database operations are wrapped in try-catch blocks
- Database transactions are used for related operations
- Soft delete patterns use `isActive` boolean fields

## Success and Error Response Formats

### Success Response
```json
{
  "statusCode": 200,
  "message": "<Resource> retrieved successfully.",
  "data": {...},
  "warning": "Optional warning message"
}
```

### Error Response (via HttpExceptionFilter)
```json
{
  "statusCode": 400,
  "message": "Validation failed.",
  "data": {
    "errors": ["Error 1", "Error 2"]
  }
}
```

### Validation Error Response
```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "data": {
    "errors": ["Field is required", "Invalid email format"]
  }
}
```

## Exception Handling

### Global Exception Filter
- `HttpExceptionFilter` in `src/common/filters/http-exception.filter.ts`
- Catches all exceptions and provides consistent error format
- Distinguishes between HTTP exceptions and unexpected errors

### Service-Level Error Handling
- Services catch Prisma errors and convert them to HTTP exceptions
- Custom error messages for common scenarios (already exists, not found)
- Clean separation between business logic and error handling

## Authentication and Guards

### JWT Authentication
- `JwtAuthGuard` extends `AuthGuard('jwt')`
- Protected routes use `@UseGuards(JwtAuthGuard)`
- User info available in `Request.user` with id, email, and role

### Permissions
- `PermissionsGuard` checks required permissions from metadata
- Decorator `@Permissions(PERMISSIONS.OPERATION)` sets required permissions
- Permission keys follow pattern: `<module>.<action>` (e.g., 'teachers.view')

### Permission Flow
1. JWT authentication validates user
2. PermissionsGuard checks user's role permissions
3. Permission decorator specifies required permissions
4. User must have all required permissions for access

## Naming and Folder Conventions

### File Structure
```
backend/src/api/
  teachers/
    teachers.module.ts
    teachers.controller.ts
    teachers.service.ts
    dto/
      create-teacher.dto.ts
      update-teacher.dto.ts
      find-teachers-query.dto.ts
      teachers-response.dto.ts
    entities/
      teacher.permission.ts
    guards/
      permissions.guard.ts
  subjects/
    // ... similar structure
  permissions/
    // ... similar structure
```

### Naming Conventions
- **Modules**: `<Feature>Module`
- **Controllers**: `<Feature>Controller` 
- **Services**: `<feature>Service`
- **DTOs**: `Create<Feature>Dto`, `Update<Feature>Dto`, `<Feature>ResponseDto`
- **Interfaces**: PascalCase
- **Types**: camelCase
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case for DTOs and entities

### Import Statements
```typescript
// Import Prisma and enums from generated files
import { Prisma, TeacherStatus } from '../../generated/prisma/client.ts';
import { TeacherStatus } from '../../generated/prisma/enums.ts';

// Import services from parent directory
import { TeachersService } from '../teachers/teachers.service.ts';

// Import DTOs
import { CreateTeacherDto } from './dto/create-teacher.dto.ts';
```

## Permissions System

### Permission Keys
- Format: `<module>.<action>` (e.g., 'teachers.view', 'subjects.create')
- Examples:
  - 'teachers.view', 'teachers.create', 'teachers.edit', 'teachers.delete'
  - 'subjects.view', 'subjects.create', 'subjects.edit', 'subjects.delete'
  - 'permissions.view'
  - 'roles.view', 'roles.create', 'roles.edit', 'roles.delete'

### Permission Decorator
```typescript
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { TEACHER_PERMISSIONS } from './entities/teacher.permission.ts';

@Permissions(TEACHER_PERMISSIONS.CREATE)
@Post()
create(@Body() dto: CreateTeacherDto) { ... }
```

### Permission Entities
- Permission constants are stored in entity files (e.g., `teacher.permission.ts`)
- Each permission is an array of string constants
- Used by the PermissionsGuard to check user access

## Code Organization

### Core Modules
- `auth.module.ts` - Authentication and JWT strategy
- `teachers.module.ts` - Teacher management
- `subjects.module.ts` - Subject management
- `permissions.module.ts` - Permission catalog
- `roles.module.ts` - Role management
- `user.module.ts` - User management

### Common Modules
- `cloudinary.module.ts` - Cloudinary image upload
- `prisma.module.ts` - Prisma database configuration

### Infrastructure
- `common/` - Shared code (filters, guards, utilities)
- `database/` - Prisma configuration and services

## Examples

### 1. Create a New Module
1. Create folder: `src/api/<feature>/`
2. Create files:
   - `<feature>.module.ts` - Module definition
   - `<feature>.controller.ts` - Controller with all CRUD endpoints
   - `<feature>.service.ts` - Service with CRUD operations
   - `dto/` - DTO files (create, update, query, response)
   - `entities/` - Permission constants
3. Import the module in `app.module.ts` or parent module
4. Add to providers if needed

### 2. API Endpoint Pattern
- All routes are protected with JWT authentication
- Each endpoint has required permissions
- Consistent error responses
- Validation for all input data
- Proper HTTP status codes
- Swagger documentation for all endpoints

### 3. Database Operations
- Use Prisma transactions for related operations
- Handle duplicate key errors (P2002)
- Handle foreign key constraint errors (P2003, P2014)
- Handle not found errors (P2025)
- Wrap all database operations in try-catch

### 4. File Upload Pattern (Cloudinary)
1. Import `CloudinaryModule`
2. Inject `CloudinaryService` in service
3. Upload files and get publicId
4. Store publicId in database
5. Delete images when records are deleted or updated
6. Handle Cloudinary errors gracefully

## Best Practices

1. Always use try-catch blocks for database operations
2. Validate all input data with DTOs
3. Use consistent error messages and formats
4. Document all API endpoints with Swagger
5. Protect all routes with appropriate authentication and permissions
6. Use transactions for related database operations
7. Handle file uploads safely and clean up resources
8. Follow the naming conventions for consistency
9. Use DTOs for request/response validation and transformation
10. Implement proper logging for debugging and monitoring

## Summary

This project follows a consistent NestJS pattern with:
- Modular architecture with clear separation of concerns
- Comprehensive validation and error handling
- Role-based access control with permissions
- Consistent API response formats
- Proper documentation with Swagger
- Database-driven permission system
- Cloudinary integration for file uploads

When creating new modules, follow these patterns and conventions to maintain consistency across the application.

---

## Module Examples

### Teachers Module
```typescript
// Module: backend/src/api/teachers/teachers.module.ts
import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { TeachersController } from './teachers.controller.ts';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.ts';
import { TeachersService } from './teachers.service.ts';

@Module({
  imports: [CloudinaryModule],
  controllers: [TeachersController],
  providers: [TeachersService, PermissionsGuard],
  exports: [TeachersService],
})
export class TeachersModule {}
```

### Subjects Module
```typescript
// Module: backend/src/api/subjects/subjects.module.ts
import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard.ts';
import { SubjectsController } from './subjects.controller.ts';
import { SubjectsService } from './subjects.service.ts';

@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService, PermissionsGuard],
  exports: [SubjectsService],
})
export class SubjectsModule {}
```

### Users Module
```typescript
// Module: backend/src/api/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service.ts';
import { UserController } from './user.controller.ts';
import { TeachersModule } from '../teachers/teachers.module.ts';

@Module({
  imports: [TeachersModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

### Permissions Module
```typescript
// Module: backend/src/api/permissions/permissions.module.ts
import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller.ts';
import { PermissionsService } from './permissions.service.ts';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
})
export class PermissionsModule {}
```

## Controller Examples

### Teachers Controller (with all features)
```typescript
@Controller('teachers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@ApiTags('Teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Permissions(TEACHER_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Create a teacher' })
  @ApiCreatedResponse({ description: 'Teacher created successfully', type: TeacherFindOneResponseDto })
  create(@Body() createTeacherDto: CreateTeacherDto, @Req() req: AuthenticatedRequest) {
    return this.teachersService.create(createTeacherDto, req.user.id);
  }

  @Permissions(TEACHER_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiOkResponse({ description: 'Teachers retrieved successfully', type: TeacherResponseDto })
  findAll(@Query() query: FindTeachersQueryDto): Promise<TeacherResponseDto> {
    return this.teachersService.findAll(query);
  }

  @Permissions(TEACHER_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get a teacher by ID' })
  findOne(@Param('id') id: string): Promise<TeacherFindOneResponseDto> {
    return this.teachersService.findOne(id);
  }

  @Permissions(TEACHER_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a teacher' })
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(id, dto);
  }

  @Permissions(TEACHER_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a teacher and linked user' })
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
```

### Subjects Controller (simplified)
```typescript
@Controller('subjects')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@ApiTags('Subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Permissions(SUBJECT_PERMISSIONS.CREATE)
  @Post()
  @ApiOperation({ summary: 'Create a subject' })
  create(@Body() createSubjectDto: CreateSubjectDto): Promise<SubjectFindOneResponseDto> {
    return this.subjectsService.create(createSubjectDto);
  }

  @Permissions(SUBJECT_PERMISSIONS.VIEW)
  @Get()
  @ApiOperation({ summary: 'List all subjects' })
  findAll(@Query() query: { searchKey?: string; type?: string; status?: string; limit?: number; offset?: number }): Promise<SubjectsResponseDto> {
    return this.subjectsService.findAll(query);
  }

  @Permissions(SUBJECT_PERMISSIONS.VIEW)
  @Get(':id')
  @ApiOperation({ summary: 'Get a subject by ID' })
  findOne(@Param('id') id: string): Promise<SubjectFindOneResponseDto> {
    return this.subjectsService.findOne(id);
  }

  @Permissions(SUBJECT_PERMISSIONS.DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subject' })
  remove(@Param('id') id: string): Promise<void> {
    return this.subjectsService.remove(id);
  }

  @Permissions(SUBJECT_PERMISSIONS.EDIT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a subject' })
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto): Promise<SubjectFindOneResponseDto> {
    return this.subjectsService.update(id, updateSubjectDto);
  }
}
```

## Service Examples

### Teachers Service (most complex)
```typescript
@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(dto: CreateTeacherDto, _userId: string): Promise<TeacherFindOneResponseDto & { temporaryPassword: string }> {
    try {
      // Validation logic (field presence, email format, etc.)
      // Business logic (generate employee ID, create user + teacher transaction)
      // Returns structured response with temporary password for new teachers
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Teacher created successfully.',
        data: teacher,
        temporaryPassword,
      };
    } catch (error) {
      await this.deleteCloudinaryImageSafely(imagePublicId);
      this.handlePrismaError(error);
    }
  }

  // Other methods: findAll, findOne, update, remove, etc.

  private handlePrismaError(error: unknown, id?: string): never {
    if (error instanceof HttpException) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Teacher employee ID, CNIC or email already exists.');
      }
      // Handle other Prisma errors...
    }
    throw new InternalServerErrorException('Teacher operation failed.');
  }
}
```

### Simple Service (Subjects)
```typescript
@Injectable()
export class SubjectsService {
  private readonly logger = new Logger(SubjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubjectDto): Promise<SubjectFindOneResponseDto> {
    try {
      // Validation (name, code, marks validation)
      // Create subject with Prisma
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Subject created successfully.',
        data: subject,
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof HttpException) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Subject code already exists.');
      }
    }
    throw new InternalServerErrorException('Subject operation failed.');
  }
}
```

## DTO Examples

### CreateTeacherDto (complex)
```typescript
export class CreateTeacherDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date | null;

  @ApiPropertyOptional({ enum: Gender, nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender | null;

  // Many more fields with validation...
}
```

### CreateSubjectDto (simple)
```typescript
export class CreateSubjectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ enum: SubjectType })
  @IsEnum(SubjectType)
  type!: SubjectType;

  @ApiPropertyOptional({ enum: SubjectStatus, default: SubjectStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SubjectStatus)
  status?: SubjectStatus;

  // Optional fields with defaults...
}
```

## Permission System Examples

### Teacher Permissions
```typescript
// File: backend/src/api/teachers/entities/teacher.permission.ts
export const TEACHER_PERMISSIONS = {
  CREATE: 'teachers.create',
  VIEW: 'teachers.view',
  EDIT: 'teachers.edit',
  DELETE: 'teachers.delete',
} as const;
```

### Subject Permissions
```typescript
// File: backend/src/api/subjects/entities/subject.permission.ts
export const SUBJECT_PERMISSIONS = {
  CREATE: 'subjects.create',
  VIEW: 'subjects.view',
  EDIT: 'subjects.edit',
  DELETE: 'subjects.delete',
} as const;
```

### Permission Decorator Usage
```typescript
import { Permissions } from '../auth/decorators/permissions.decorator.ts';
import { TEACHER_PERMISSIONS } from './entities/teacher.permission.ts';

@Permissions(TEACHER_PERMISSIONS.CREATE)
@Post()
create(@Body() dto: CreateTeacherDto) { ... }

@Permissions(TEACHER_PERMISSIONS.VIEW)
@Get()
findAll(@Query() query: FindTeachersQueryDto) { ... }
```

## File Upload Pattern (Cloudinary)

### CloudinaryController
```typescript
@Controller('uploads')
@ApiTags('Uploads')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(ImageUploadInterceptor())
  @ApiOperation({ summary: 'Upload an image to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Image file required');
    const returnFile = this.cloudinaryService.uploadImage(file);
    return returnFile;
  }
}
```

## Authentication Examples

### LoginController
```typescript
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }
}
```

## Error Handling Examples

### Global Exception Filter
```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Process exception response and return structured error
    response.status(statusCode).json({
      statusCode,
      message: this.extractMessage(exception),
      data: this.extractData(exception),
    });
  }

  private extractMessage(exception: unknown): string {
    // Extract and format error message
  }

  private extractData(exception: unknown): any {
    // Extract error details
  }
}
```

## Summary

This document provides comprehensive guidelines for creating NestJS modules in this project. Key principles include:

1. **Consistency**: All modules follow the same structure and patterns
2. **Validation**: Use class-validator for all DTO validation
3. **Error Handling**: Structured error responses with consistent format
4. **Permissions**: Role-based access control with consistent permission system
5. **Documentation**: Complete Swagger documentation for all endpoints
6. **Testing**: Follow the same patterns for testing (not shown here)

When creating new modules, use these examples as templates and ensure your implementation matches the established patterns.