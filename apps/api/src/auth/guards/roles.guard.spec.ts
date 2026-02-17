import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@secure-task/data';

function createMockContext(user: { role: string } | null): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(createMockContext({ role: 'Viewer' }))).toBe(true);
  });

  it('should allow when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin, Role.Owner]);
    expect(guard.canActivate(createMockContext({ role: 'Admin' }))).toBe(true);
  });

  it('should throw ForbiddenException when user role is not in required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Owner]);
    expect(() => guard.canActivate(createMockContext({ role: 'Viewer' }))).toThrow('Insufficient role');
  });
});
