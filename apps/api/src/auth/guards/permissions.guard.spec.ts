import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { Permission } from '@secure-task/auth';

function createMockContext(user: { role: string } | null): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('should allow when no permission is required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(createMockContext({ role: 'Viewer' }))).toBe(true);
  });

  it('should allow Owner to create task', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(Permission.TaskCreate);
    expect(guard.canActivate(createMockContext({ role: 'Owner' }))).toBe(true);
  });

  it('should deny Viewer task:create', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(Permission.TaskCreate);
    expect(() => guard.canActivate(createMockContext({ role: 'Viewer' }))).toThrow('Insufficient permission');
  });
});
