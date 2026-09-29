import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../users/entities/user.entity';
import { AuthUser } from './auth-user';

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
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.jwtService.sign({ sub: user.id }),
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

  async changePassword(authUser: AuthUser, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(authUser.email);
    if (!user) throw new UnauthorizedException();

    // A temporary password was just used to log in, so it doesn't need re-entering.
    if (!user.mustChangePassword) {
      if (!dto.currentPassword || !(await bcrypt.compare(dto.currentPassword, user.password))) {
        throw new BadRequestException('Current password is incorrect');
      }
    }
    if (await bcrypt.compare(dto.newPassword, user.password)) {
      throw new BadRequestException('New password must be different from the current one');
    }

    await this.usersService.updatePassword(user.id, dto.newPassword);
  }

  async getMe(userId: number): Promise<User | null> {
    return this.usersService.findOne(userId);
  }

  async updateMe(userId: number, dto: UpdateProfileDto): Promise<User> {
    return this.usersService.updateUser(userId, dto);
  }
}
