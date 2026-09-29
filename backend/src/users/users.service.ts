import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums';
import { AuthUser } from '../auth/auth-user';

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

  async findOneOrFail(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Includes the password hash, for credential checks only. */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.department', 'department')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  async findByDepartment(departmentId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { departmentId },
      relations: ['department'],
      select: USER_SELECT,
    });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
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
    return this.findOneOrFail(saved.id);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.update(id, dto);
    return this.findOneOrFail(id);
  }

  /** Admin edits, with guards against an admin locking themselves out. */
  async updateUserAsAdmin(id: number, dto: UpdateUserDto, actor: AuthUser): Promise<User> {
    if (id === actor.id) {
      if (dto.isActive === false) throw new BadRequestException('You cannot deactivate your own account');
      if (dto.role && dto.role !== UserRole.ADMIN) throw new BadRequestException('You cannot remove your own admin role');
    }
    return this.updateUser(id, dto);
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
    // 12 random bytes -> 16 URL-safe characters, plus a suffix for common complexity rules.
    const temporaryPassword = randomBytes(12).toString('base64url') + 'A1!';
    user.password = await bcrypt.hash(temporaryPassword, 10);
    user.mustChangePassword = true;
    await this.usersRepository.save(user);
    return { temporaryPassword };
  }
}
