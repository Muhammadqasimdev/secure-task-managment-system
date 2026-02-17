import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from '../entities/organization.entity';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { PERMISSIONS_BY_ROLE } from '@secure-task/auth';
import type { JwtPayload } from './decorators/current-user.decorator';
import type { LoginResponseDto, UserDto, RegisterDto } from '@secure-task/data';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>
  ) {}

  async validateUser(email: string, password: string): Promise<UserDto | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return this.toUserDto(user);
  }

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const userDto = await this.validateUser(email, password);
    if (!userDto) throw new UnauthorizedException('Invalid email or password');
    this.audit.log({
      userId: userDto.id,
      action: 'auth.login',
      resource: 'auth',
      result: 'success',
      details: userDto.email,
    });
    const payload: JwtPayload = {
      sub: userDto.id,
      email: userDto.email,
      role: userDto.role,
      organizationId: userDto.organizationId,
    };
    const access_token = this.jwtService.sign(payload);
    const permissions = PERMISSIONS_BY_ROLE[userDto.role] ?? [];
    return { access_token, user: userDto, permissions };
  }

  async register(dto: RegisterDto): Promise<LoginResponseDto> {
    if (!dto?.email?.trim() || !dto?.password?.trim()) {
      throw new BadRequestException('Email and password are required');
    }
    if (!['Owner', 'Admin', 'Viewer'].includes(dto.role)) {
      throw new BadRequestException('Role must be Owner, Admin, or Viewer');
    }
    const existing = await this.usersService.findByEmail(dto.email.trim());
    if (existing) throw new ConflictException('Email already registered');
    const [org] = await this.orgRepo.find({ take: 1 });
    if (!org) throw new BadRequestException('No organization available');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email.trim().toLowerCase(),
      passwordHash: hash,
      role: dto.role,
      organizationId: org.id,
    });
    const userDto = this.toUserDto(user);
    this.audit.log({
      userId: user.id,
      action: 'auth.register',
      resource: 'auth',
      result: 'success',
      details: user.email,
    });
    return this.login(userDto.email, dto.password);
  }

  async getMe(payload: JwtPayload): Promise<{ user: UserDto; permissions: string[] }> {
    const user: UserDto = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    };
    const permissions = PERMISSIONS_BY_ROLE[payload.role] ?? [];
    return { user, permissions };
  }

  toUserDto(user: { id: string; email: string; role: string; organizationId: string }): UserDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
  }
}
