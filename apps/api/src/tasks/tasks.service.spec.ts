import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from '../entities/task.entity';
import { AuditService } from '../audit/audit.service';
import { TaskStatus, TaskCategory } from '@secure-task/data';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepo: jest.Mocked<Repository<Task>>;
  let auditService: jest.Mocked<AuditService>;

  const mockUser: JwtPayload = {
    sub: 'user-1',
    email: 'admin@example.com',
    role: 'Owner',
    organizationId: 'org-1',
  };

  const mockTask = {
    id: 'task-1',
    title: 'Test',
    description: null,
    status: TaskStatus.Todo,
    category: TaskCategory.Work,
    orderIndex: 0,
    organizationId: 'org-1',
    createdByUserId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    taskRepo = {
      create: jest.fn().mockImplementation((dto) => ({ ...mockTask, ...dto })),
      save: jest.fn().mockResolvedValue(mockTask),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTask]),
      })),
      remove: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<Task>>;
    auditService = { log: jest.fn() } as unknown as jest.Mocked<AuditService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: taskRepo },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException when task does not exist', async () => {
      taskRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing', mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when task belongs to another org', async () => {
      taskRepo.findOne.mockResolvedValue({ ...mockTask, organizationId: 'other-org' } as Task);
      await expect(service.findOne('task-1', mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('should return task when in same org', async () => {
      taskRepo.findOne.mockResolvedValue(mockTask as Task);
      const result = await service.findOne('task-1', mockUser);
      expect(result).toEqual(mockTask);
    });
  });
});
