import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtRecord } from '../ot-records/entities/ot-record.entity';
import { User } from '../users/entities/user.entity';
import { Department } from '../departments/entities/department.entity';
import { OtStatus, UserRole } from '../common/enums';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(OtRecord)
    private otRecordsRepository: Repository<OtRecord>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async getDashboardStats() {
    const totalOtRecords = await this.otRecordsRepository.count();
    const pendingOtRecords = await this.otRecordsRepository.count({
      where: { status: OtStatus.PENDING },
    });
    const approvedOtRecords = await this.otRecordsRepository.count({
      where: { status: OtStatus.APPROVED },
    });
    const totalUsers = await this.usersRepository.count({
      where: { role: UserRole.REGULAR },
    });

    const totalOtHours = await this.otRecordsRepository
      .createQueryBuilder('otRecord')
      .select('SUM(otRecord.duration)', 'total')
      .where('otRecord.status = :status', { status: OtStatus.APPROVED })
      .getRawOne();

    const avgOtDuration = await this.otRecordsRepository
      .createQueryBuilder('otRecord')
      .select('AVG(otRecord.duration)', 'average')
      .where('otRecord.status = :status', { status: OtStatus.APPROVED })
      .getRawOne();

    return {
      totalOtRecords,
      pendingOtRecords,
      approvedOtRecords,
      totalUsers,
      totalOtHours: parseFloat(totalOtHours.total) || 0,
      avgOtDuration: parseFloat(avgOtDuration.average) || 0,
    };
  }

  async getOtByDepartment() {
    const result = await this.otRecordsRepository
      .createQueryBuilder('otRecord')
      .leftJoin('otRecord.user', 'user')
      .leftJoin('user.department', 'department')
      .select('department.name', 'departmentName')
      .addSelect('COUNT(otRecord.id)', 'count')
      .addSelect('SUM(otRecord.duration)', 'totalHours')
      .where('otRecord.status = :status', { status: 'approved' })
      .groupBy('department.id, department.name')
      .getRawMany();

    return result.map(item => ({
      departmentName: item.departmentName,
      count: parseInt(item.count),
      totalHours: parseFloat(item.totalHours) || 0,
    }));
  }

  async getMonthlyOtStats(_year?: number) {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    const sixMonthsAgo = d.toISOString().split('T')[0];

    const result = await this.otRecordsRepository.query(
      `SELECT EXTRACT(MONTH FROM date)::int AS month,
              COUNT(id)::int AS count,
              COALESCE(SUM(duration), 0)::float AS "totalHours"
       FROM ot_records
       WHERE date >= $1 AND status = 'approved'
       GROUP BY EXTRACT(MONTH FROM date)
       ORDER BY month ASC`,
      [sixMonthsAgo],
    );

    return result.map((item: { month: number; count: number; totalHours: number }) => ({
      month: item.month,
      count: item.count,
      totalHours: item.totalHours,
    }));
  }

  async getTopOtUsers(limit: number = 10) {
    const result = await this.otRecordsRepository
      .createQueryBuilder('otRecord')
      .leftJoin('otRecord.user', 'user')
      .leftJoin('user.department', 'department')
      .select('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('department.name', 'departmentName')
      .addSelect('COUNT(otRecord.id)', 'count')
      .addSelect('SUM(otRecord.duration)', 'totalHours')
      .where('otRecord.status = :status', { status: 'approved' })
      .groupBy('user.id, user.firstName, user.lastName, department.name')
      .orderBy('SUM(otRecord.duration)', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(item => ({
      name: `${item.firstName} ${item.lastName}`,
      departmentName: item.departmentName,
      count: parseInt(item.count),
      totalHours: parseFloat(item.totalHours) || 0,
    }));
  }

  async getOtTrends(days: number = 30) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const cutoff = d.toISOString().split('T')[0];

    const result = await this.otRecordsRepository.query(
      `SELECT date::text AS date,
              COUNT(id)::int AS count,
              COALESCE(SUM(duration), 0)::float AS "totalHours"
       FROM ot_records
       WHERE date >= $1
       GROUP BY date
       ORDER BY date ASC`,
      [cutoff],
    );

    return result.map((item: { date: string; count: number; totalHours: number }) => ({
      date: item.date,
      count: item.count,
      totalHours: item.totalHours,
    }));
  }
}
