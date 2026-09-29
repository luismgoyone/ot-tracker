import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../common/enums';
import { AuthUser } from '../auth-user';
import { RolesGuard } from './roles.guard';
import { PasswordChangeGuard } from './password-change.guard';

const user = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 1,
  email: 'a@b.c',
  role: UserRole.REGULAR,
  departmentId: 1,
  mustChangePassword: false,
  ...overrides,
});

const contextFor = (requestUser?: AuthUser) =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user: requestUser }) }),
  }) as unknown as ExecutionContext;

const reflectorReturning = (value: unknown) =>
  ({ getAllAndOverride: () => value }) as unknown as Reflector;

describe('RolesGuard', () => {
  it('allows routes without a role requirement', () => {
    expect(new RolesGuard(reflectorReturning(undefined)).canActivate(contextFor(user()))).toBe(true);
  });

  it('allows matching roles and rejects others', () => {
    const guard = new RolesGuard(reflectorReturning([UserRole.SUPERVISOR]));
    expect(guard.canActivate(contextFor(user({ role: UserRole.SUPERVISOR })))).toBe(true);
    expect(guard.canActivate(contextFor(user({ role: UserRole.REGULAR })))).toBe(false);
  });

  it('always allows admins', () => {
    const guard = new RolesGuard(reflectorReturning([UserRole.SUPERVISOR]));
    expect(guard.canActivate(contextFor(user({ role: UserRole.ADMIN })))).toBe(true);
  });

  it('rejects when there is no user', () => {
    const guard = new RolesGuard(reflectorReturning([UserRole.SUPERVISOR]));
    expect(guard.canActivate(contextFor(undefined))).toBe(false);
  });
});

describe('PasswordChangeGuard', () => {
  it('lets users without a pending change through', () => {
    expect(new PasswordChangeGuard(reflectorReturning(undefined)).canActivate(contextFor(user()))).toBe(true);
  });

  it('blocks users with a temporary password', () => {
    const guard = new PasswordChangeGuard(reflectorReturning(undefined));
    expect(() => guard.canActivate(contextFor(user({ mustChangePassword: true })))).toThrow(ForbiddenException);
  });

  it('allows routes marked for pending password changes', () => {
    const guard = new PasswordChangeGuard(reflectorReturning(true));
    expect(guard.canActivate(contextFor(user({ mustChangePassword: true })))).toBe(true);
  });
});
