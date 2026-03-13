import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT: (keyof User)[] = [
  'id', 'email', 'firstName', 'lastName', 'role',
  'departmentId', 'isActive', 'mustChangePassword', 'createdAt',
];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['department'],
      select: USER_SELECT,
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['department'],
      select: USER_SELECT,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['department'],
    });
  }

  async findByDepartment(departmentId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { departmentId },
      relations: ['department'],
      select: USER_SELECT,
    });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.temporaryPassword, 10);
    const user = this.usersRepository.create({
      email: dto.email,
      password: hashed,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      departmentId: dto.departmentId,
      mustChangePassword: true,
      isActive: true,
    });
    const saved = await this.usersRepository.save(user);
    const { password: _pw, ...result } = saved as User & { password: string };
    return result as User;
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    const saved = await this.usersRepository.save(user);
    const { password: _pw, ...result } = saved as User & { password: string };
    return result as User;
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await this.usersRepository.save(user);
  }

  async resetPassword(id: number): Promise<{ temporaryPassword: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const temporaryPassword = Math.random().toString(36).slice(-10) + 'A1!';
    user.password = await bcrypt.hash(temporaryPassword, 10);
    user.mustChangePassword = true;
    await this.usersRepository.save(user);
    return { temporaryPassword };
  }
}
