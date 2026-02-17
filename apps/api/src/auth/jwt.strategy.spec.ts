import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';

const originalEnv = process.env;

describe('JwtStrategy', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: 'test-secret' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    const strategy = new JwtStrategy();
    expect(strategy).toBeDefined();
  });

  it('should validate and return user payload', () => {
    const strategy = new JwtStrategy();
    const payload = {
      sub: 'user-1',
      email: 'test@example.com',
      role: 'Admin',
      organizationId: 'org-1',
    };
    const result = strategy.validate(payload);
    expect(result).toEqual({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'Admin',
      organizationId: 'org-1',
    });
  });
});
