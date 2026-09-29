import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OtRecord } from './entities/ot-record.entity';
import { CreateOtRecordDto } from './dto/create-ot-record.dto';
import { UpdateOtRecordDto } from './dto/update-ot-record.dto';
import { UpdateOtStatusDto } from './dto/update-ot-status.dto';
import { FindOtRecordsQueryDto } from './dto/find-ot-records-query.dto';
import { OtStatus, UserRole } from '../common/enums';
import { PaginatedResult, PaginationQueryDto, paginate } from '../common/dto/pagination-query.dto';
import { AuthUser } from '../auth/auth-user';
import { calculateOtHours } from './duration';

const RELATIONS = { user: { department: true } };

@Injectable()
export class OtRecordsService {
  private readonly timezone: string;

  constructor(
    @InjectRepository(OtRecord)
    private otRecordsRepository: Repository<OtRecord>,
    config: ConfigService,
  ) {
    this.timezone = config.get<string>('APP_TIMEZONE', 'Asia/Manila');
  }

  async create(dto: CreateOtRecordDto, userId: number): Promise<OtRecord> {
    const otRecord = this.otRecordsRepository.create({
      ...dto,
      date: dto.date as unknown as Date,
      duration: calculateOtHours(dto.startTime, dto.endTime),
      userId,
    });
    const saved = await this.otRecordsRepository.save(otRecord);
    return this.findOneOrFail(saved.id);
  }

  /** Supervisors only see their own department; admins can see all or filter by department. */
  async findAll(query: FindOtRecordsQueryDto, actor: AuthUser): Promise<PaginatedResult<OtRecord>> {
    const qb = this.otRecordsRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .leftJoinAndSelect('user.department', 'department')
      .orderBy('record.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    if (query.status) qb.andWhere('record.status = :status', { status: query.status });

    const departmentId = actor.role === UserRole.ADMIN ? query.departmentId : actor.departmentId;
    if (departmentId !== undefined) qb.andWhere('user.departmentId = :departmentId', { departmentId });

    const search = query.search?.trim();
    if (search) {
      const term = `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
      qb.andWhere(
        new Brackets((w) =>
          w
            .where(`CONCAT(user.firstName, ' ', user.lastName) ILIKE :term`, { term })
            .orWhere('department.name ILIKE :term', { term })
            .orWhere('record.reason ILIKE :term', { term }),
        ),
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, query);
  }

  /** Totals across all of the user's records (not just the current page). */
  async getSummary(userId: number) {
    const [row] = await this.otRecordsRepository.query(
      `SELECT
         COUNT(*)::int AS "totalRecords",
         COUNT(*) FILTER (WHERE status = 'pending')::int AS "pendingRecords",
         COALESCE(SUM(duration) FILTER (WHERE status = 'approved'), 0)::float AS "approvedHours",
         COALESCE(SUM(duration) FILTER (
           WHERE status = 'approved' AND date >= date_trunc('month', (now() AT TIME ZONE $2)::date)
         ), 0)::float AS "approvedHoursThisMonth"
       FROM ot_records
       WHERE user_id = $1`,
      [userId, this.timezone],
    );
    return row;
  }

  async findByUser(userId: number, query: PaginationQueryDto): Promise<PaginatedResult<OtRecord>> {
    const [data, total] = await this.otRecordsRepository.findAndCount({
      where: { userId },
      relations: RELATIONS,
      order: { date: 'DESC', createdAt: 'DESC' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return paginate(data, total, query);
  }

  /**
   * Approve or reject a pending record. Supervisors may only decide on records from
   * their own department, and nobody may decide on their own overtime.
   */
  async updateStatus(id: number, dto: UpdateOtStatusDto, actor: AuthUser): Promise<OtRecord> {
    const record = await this.findOneOrFail(id);

    if (record.userId === actor.id) {
      throw new ForbiddenException('You cannot approve or reject your own overtime');
    }
    if (actor.role !== UserRole.ADMIN && record.user.departmentId !== actor.departmentId) {
      throw new ForbiddenException('You can only review overtime from your own department');
    }
    if (record.status !== OtStatus.PENDING) {
      throw new ConflictException(`This record has already been ${record.status}`);
    }

    await this.otRecordsRepository.update(id, {
      status: dto.status,
      approvedBy: actor.id,
      ...(dto.comments !== undefined && { comments: dto.comments }),
    });
    return this.findOneOrFail(id);
  }

  /** Owners can edit their own records while they're still pending. */
  async update(id: number, dto: UpdateOtRecordDto, actor: AuthUser): Promise<OtRecord> {
    const record = await this.findOneOrFail(id);
    this.assertCanModify(record, actor);

    const startTime = dto.startTime ?? record.startTime;
    const endTime = dto.endTime ?? record.endTime;
    await this.otRecordsRepository.update(id, {
      ...dto,
      ...(dto.date && { date: dto.date as unknown as Date }),
      duration: calculateOtHours(startTime, endTime),
    });
    return this.findOneOrFail(id);
  }

  /** Owners can delete their own pending records; admins can delete any record. */
  async remove(id: number, actor: AuthUser): Promise<void> {
    const record = await this.findOneOrFail(id);
    if (actor.role !== UserRole.ADMIN) this.assertCanModify(record, actor);
    await this.otRecordsRepository.delete(id);
  }

  private assertCanModify(record: OtRecord, actor: AuthUser): void {
    if (record.userId !== actor.id) {
      throw new ForbiddenException('You can only change your own overtime records');
    }
    if (record.status !== OtStatus.PENDING) {
      throw new ConflictException(`This record has already been ${record.status} and can no longer be changed`);
    }
  }

  private async findOneOrFail(id: number): Promise<OtRecord> {
    const record = await this.otRecordsRepository.findOne({ where: { id }, relations: RELATIONS });
    if (!record) throw new NotFoundException(`OT record ${id} not found`);
    return record;
  }
}
