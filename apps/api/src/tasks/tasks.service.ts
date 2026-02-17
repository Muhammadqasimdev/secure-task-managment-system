import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { TaskStatus, TaskCategory } from '@secure-task/data';
import type { CreateTaskDto, UpdateTaskDto } from '@secure-task/data';
import { hasPermission, Permission } from '@secure-task/auth';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly audit: AuditService
  ) {}

  async create(dto: CreateTaskDto, user: JwtPayload): Promise<Task> {
    if (!dto?.title?.trim()) {
      throw new BadRequestException('Title is required');
    }
    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? TaskStatus.Todo,
      category: dto.category ?? TaskCategory.Work,
      orderIndex: dto.orderIndex ?? 0,
      organizationId: user.organizationId,
      createdByUserId: user.sub,
    });
    const saved = await this.taskRepo.save(task);
    this.audit.log({
      userId: user.sub,
      action: 'task.create',
      resource: `task:${saved.id}`,
      result: 'success',
      details: saved.title,
    });
    return saved;
  }

  async findAll(
    user: JwtPayload,
    sort?: string,
    category?: TaskCategory,
    status?: TaskStatus
  ): Promise<Task[]> {
    const qb = this.taskRepo
      .createQueryBuilder('task')
      .where('task.organizationId = :orgId', { orgId: user.organizationId });
    if (category) qb.andWhere('task.category = :category', { category });
    if (status) qb.andWhere('task.status = :status', { status });
    if (sort === 'createdAt') qb.orderBy('task.createdAt', 'DESC');
    else if (sort === 'orderIndex') qb.orderBy('task.orderIndex', 'ASC');
    else qb.orderBy('task.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string, user: JwtPayload): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied to this task');
    }
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, user: JwtPayload): Promise<Task> {
    const task = await this.findOne(id, user);
    if (dto.title != null) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status != null) task.status = dto.status;
    if (dto.category != null) task.category = dto.category;
    if (dto.orderIndex != null) task.orderIndex = dto.orderIndex;
    const saved = await this.taskRepo.save(task);
    this.audit.log({
      userId: user.sub,
      action: 'task.update',
      resource: `task:${id}`,
      result: 'success',
    });
    return saved;
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    const task = await this.findOne(id, user);
    await this.taskRepo.remove(task);
    this.audit.log({
      userId: user.sub,
      action: 'task.delete',
      resource: `task:${id}`,
      result: 'success',
    });
  }
}
