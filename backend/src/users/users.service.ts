import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['department'],
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'departmentId', 'createdAt'],
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['department'],
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'departmentId', 'createdAt'],
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
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'departmentId', 'createdAt'],
    });
  }
}
