import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password' | 'fullName'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    if (!user.isActive) return null;
    if (await bcrypt.compare(password, user.password)) {
      const { password: _pw, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      departmentId: user.departmentId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        departmentId: user.departmentId,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    await this.usersService.updatePassword(userId, dto.newPassword);
  }

  async getMe(userId: number): Promise<User | null> {
    return this.usersService.findOne(userId);
  }

  async updateMe(userId: number, dto: UpdateProfileDto): Promise<User> {
    return this.usersService.updateUser(userId, dto);
  }

  async validateToken(payload: { sub: number }): Promise<User | null> {
    return this.usersService.findOne(payload.sub);
  }
}
