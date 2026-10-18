import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './api/auth/auth.module';
import { UserModule } from './api/user/user.module';
import { PrismaModule } from './database/prisma.module';
import { RolesModule } from './api/roles/roles.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, RolesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
