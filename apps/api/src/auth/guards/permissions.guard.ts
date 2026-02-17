import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { hasPermission, type Permission } from '@secure-task/auth';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<Permission>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermission) return true;
    const { user } = context.switchToHttp().getRequest<{ user: { role: string } }>();
    if (!hasPermission(user?.role, requiredPermission)) {
      throw new ForbiddenException('Insufficient permission');
    }
    return true;
  }
}
