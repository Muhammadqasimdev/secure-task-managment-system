import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@secure-task/data';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Owner)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  getAuditLog(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: JwtPayload
  ) {
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const { entries, total } = this.auditService.getEntries(pageNum, limitNum);
    if (user) {
      this.auditService.log({
        userId: user.sub,
        action: 'audit.read',
        resource: 'audit-log',
        result: 'success',
      });
    }
    return { entries, total, page: pageNum, limit: limitNum };
  }
}
