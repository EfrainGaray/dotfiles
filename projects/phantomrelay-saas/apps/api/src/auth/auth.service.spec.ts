import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  plan: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create a user with hashed password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.plan.findUnique.mockResolvedValue({ id: 'plan-free', name: 'free' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        passwordHash: 'hashed-password',
      });

      const result = await service.register('test@example.com', 'password123', 'Test');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
            passwordHash: 'hashed-password',
            name: 'Test',
            planId: 'plan-free',
          }),
        }),
      );
      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
    });

    it('should reject duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register('existing@example.com', 'password', 'Test'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return user for correct credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        name: 'Test',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const user = { id: 'user-1', email: 'test@example.com' };

      const result = await service.login(user);

      expect(mockJwt.sign).toHaveBeenCalledWith({ sub: 'user-1', email: 'test@example.com' });
      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        user,
      });
    });
  });

  describe('findOrCreateOAuthUser', () => {
    it('should create a new user when no match found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.plan.findUnique.mockResolvedValue({ id: 'plan-free', name: 'free' });
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-new',
        email: 'oauth@example.com',
        name: 'OAuth User',
        avatarUrl: 'https://avatar.url',
        provider: 'GOOGLE',
        providerId: 'google-123',
        passwordHash: null,
      });

      const result = await service.findOrCreateOAuthUser(
        'GOOGLE',
        'google-123',
        'oauth@example.com',
        'OAuth User',
        'https://avatar.url',
      );

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'user-new');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should link existing email to OAuth provider', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null); // no provider match
      // findUnique is called twice: first in register check (not here), then for email lookup
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-existing',
        email: 'oauth@example.com',
        name: 'Existing User',
        avatarUrl: null,
        passwordHash: 'hashed',
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-existing',
        email: 'oauth@example.com',
        name: 'Existing User',
        avatarUrl: 'https://avatar.url',
        provider: 'GITHUB',
        providerId: 'github-456',
        passwordHash: 'hashed',
      });

      const result = await service.findOrCreateOAuthUser(
        'GITHUB',
        'github-456',
        'oauth@example.com',
        'OAuth User',
        'https://avatar.url',
      );

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-existing' },
          data: expect.objectContaining({
            provider: 'GITHUB',
            providerId: 'github-456',
          }),
        }),
      );
      expect(result).not.toHaveProperty('passwordHash');
    });
  });
});
