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
