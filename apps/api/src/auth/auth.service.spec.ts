import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Organization } from '../entities/organization.entity';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let auditService: jest.Mocked<AuditService>;

  const mockUser = {
    id: 'user-1',
    email: 'admin@example.com',
    passwordHash: '',
    role: 'Owner',
    organizationId: 'org-1',
  };

  beforeEach(async () => {
    mockUser.passwordHash = await bcrypt.hash('admin123', 10);
    usersService = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;
    jwtService = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
    } as unknown as jest.Mocked<JwtService>;
    auditService = {
      log: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    const mockOrgRepo = { find: jest.fn().mockResolvedValue([{ id: 'org-1', name: 'Default' }]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: AuditService, useValue: auditService },
        { provide: getRepositoryToken(Organization), useValue: mockOrgRepo },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access_token and user when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      const result = await service.login('admin@example.com', 'admin123');
      expect(result).toHaveProperty('access_token', 'fake-jwt-token');
      expect(result.user).toMatchObject({ id: 'user-1', email: 'admin@example.com', role: 'Owner' });
      expect(auditService.log).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.login('unknown@example.com', 'pass')).rejects.toThrow(UnauthorizedException);
      expect(auditService.log).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      await expect(service.login('admin@example.com', 'wrong')).rejects.toThrow(UnauthorizedException);
      expect(auditService.log).not.toHaveBeenCalled();
    });
  });
});
