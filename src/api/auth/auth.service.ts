import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../database/prisma.service.ts';
import { LoginDto } from './dto/login.dto.ts';
import {
  LoginResponseDto,
  LoginResponseUserDto,
} from '../user/dto/user-response.dto.ts';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const { email, password } = loginDto;
      const errors: string[] = [];

      // Validate input
      if (!email?.trim()) {
        errors.push('Email is required.');
      }

      if (!password?.trim()) {
        errors.push('Password is required.');
      }

      // Return all validation errors together
      if (errors.length > 0) {
        throw new HttpException({ errors }, HttpStatus.BAD_REQUEST);
      }

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          password: true,
          name: true,
          isActive: true,
          id: true,
          email: true,
          roleId: true,
          gender: true,
          age: true,
          isSystem: true,
          role: {
            select: {
              id: true,
              name: true,
              slug: true,
              permissions: {
                select: {
                  permission: {
                    select: {
                      key: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new HttpException('Invalid email', HttpStatus.UNAUTHORIZED);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new HttpException('Invalid password.', HttpStatus.UNAUTHORIZED);
      }

      // Check account status
      if (!user.isActive) {
        throw new HttpException(
          'Your account is inactive.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Generate JWT
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.roleId,
      };

      const accessToken = await this.jwtService.signAsync(payload);

      const userReturn: LoginResponseUserDto = {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        role: {
          id: user.role.id,
          name: user.role.name,
          slug: user.role.slug,
          permissions: user.role.permissions.map((permission) => ({
            key: permission.permission.key,
          })),
        },
        isActive: user.isActive,
        isSystem: user.isSystem,
        gender: user.gender,
      };

      return {
        accessToken,
        user: userReturn,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('LOGIN ERROR:', error);

      throw new HttpException(
        { errors: ['An unexpected error occurred.'] },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
