import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OtRecord } from './entities/ot-record.entity';
import { CreateOtRecordDto } from './dto/create-ot-record.dto';
import { UpdateOtRecordDto } from './dto/update-ot-record.dto';
import { OtStatus } from '../common/enums';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

@Injectable()
export class OtRecordsService {
  constructor(
    @InjectRepository(OtRecord)
    private otRecordsRepository: Repository<OtRecord>,
  ) {}

  async create(createOtRecordDto: CreateOtRecordDto, userId: number): Promise<OtRecord> {
    const otRecord = this.otRecordsRepository.create({
      ...createOtRecordDto,
      userId,
    });
    return this.otRecordsRepository.save(otRecord);
  }

  async findAll(page = 1, limit = 10, status?: OtStatus): Promise<PaginatedResult<OtRecord>> {
    const where = status ? { status } : {};
    const [data, total] = await this.otRecordsRepository.findAndCount({
      where,
      relations: ['user', 'user.department'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findByUser(userId: number, page = 1, limit = 10): Promise<PaginatedResult<OtRecord>> {
    const [data, total] = await this.otRecordsRepository.findAndCount({
      where: { userId },
      relations: ['user', 'user.department'],
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findByDepartment(departmentId: number): Promise<OtRecord[]> {
    return this.otRecordsRepository.find({
      where: { user: { departmentId } },
      relations: ['user', 'user.department'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<OtRecord[]> {
    return this.otRecordsRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      relations: ['user', 'user.department'],
      order: { date: 'DESC' },
    });
  }

  async updateStatus(id: number, status: OtStatus, approvedBy?: number): Promise<OtRecord> {
    await this.otRecordsRepository.update(id, {
      status,
      approvedBy,
    });
    const otRecord = await this.otRecordsRepository.findOne({
      where: { id },
      relations: ['user', 'user.department'],
    });
    if (!otRecord) {
      throw new Error(`OT Record with id ${id} not found`);
    }
    return otRecord;
  }

  async update(id: number, updateOtRecordDto: UpdateOtRecordDto): Promise<OtRecord> {
    await this.otRecordsRepository.update(id, updateOtRecordDto);
    const otRecord = await this.otRecordsRepository.findOne({
      where: { id },
      relations: ['user', 'user.department'],
    });
    if (!otRecord) {
      throw new Error(`OT Record with id ${id} not found`);
    }
    return otRecord;
  }

  async remove(id: number): Promise<void> {
    await this.otRecordsRepository.delete(id);
  }
}
