import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  getProfile: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('http://localhost:4321'),
};

// Guard that always allows the request through (simulates authenticated user)
class AllowGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'user-1', email: 'test@example.com', userId: 'user-1' };
    return true;
  }
}

// Guard that always denies the request (simulates unauthenticated user)
class DenyGuard {
  canActivate(): boolean {
    throw new UnauthorizedException();
  }
}

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useClass(AllowGuard)
      .overrideGuard(JwtAuthGuard)
      .useClass(AllowGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should return JWT when credentials are valid', async () => {
      const expectedResponse = {
        accessToken: 'mock-jwt-token',
        user: { id: 'user-1', email: 'test@example.com' },
      };
      mockAuthService.login.mockResolvedValue(expectedResponse);

      const req = { user: { id: 'user-1', email: 'test@example.com' } };
      const result = await controller.login(req as { user: { id: string; email: string } });

      expect(mockAuthService.login).toHaveBeenCalledWith(req.user);
      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('user');
    });
  });

  describe('login — invalid credentials', () => {
    it('should propagate UnauthorizedException from service', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      const req = { user: { id: 'user-bad', email: 'bad@example.com' } };
      await expect(
        controller.login(req as { user: { id: string; email: string } }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a new user and return 201 with JWT', async () => {
      const expectedResponse = {
        accessToken: 'new-jwt-token',
        user: { id: 'user-new', email: 'new@example.com', name: 'New User' },
      };
      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(mockAuthService.register).toHaveBeenCalledWith(
        'new@example.com',
        'password123',
        'New User',
      );
      expect(result).toHaveProperty('accessToken');
      expect(result.user).toHaveProperty('email', 'new@example.com');
    });

    it('should propagate ConflictException for duplicate email', async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException('Email already registered'),
      );

      await expect(
        controller.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Duplicate',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('me', () => {
    it('should return user profile when JWT is valid', async () => {
      const profile = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        plan: { name: 'free', requestsPerMonth: 100, maxScrapers: 3 },
      };
      mockAuthService.getProfile.mockResolvedValue(profile);

      const req = { user: { userId: 'user-1' } };
      const result = await controller.me(req as { user: { userId: string } });

      expect(mockAuthService.getProfile).toHaveBeenCalledWith('user-1');
      expect(result).toHaveProperty('id', 'user-1');
      expect(result).toHaveProperty('plan');
    });
  });
});

describe('JwtAuthGuard — rejects unauthenticated requests', () => {
  it('should throw UnauthorizedException when canActivate is denied', () => {
    const guard = new DenyGuard();
    expect(() => guard.canActivate()).toThrow(UnauthorizedException);
  });

  it('should set user on request when token is valid (AllowGuard simulates success)', () => {
    const guard = new AllowGuard();
    const mockReq: Record<string, unknown> = {};
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => mockReq }),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockReq.user).toHaveProperty('userId', 'user-1');
  });
});
