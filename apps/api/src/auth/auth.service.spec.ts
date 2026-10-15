import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwt: JwtService;

  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  } as unknown as PrismaService;

  const hashToken = (t: string) =>
    createHash('sha256').update(t).digest('hex');

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access';
    process.env.JWT_REFRESH_SECRET = 'test-refresh';
    process.env.JWT_ACCESS_TTL = '15m';
    process.env.JWT_REFRESH_TTL = '7d';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jwt = new JwtService({});
    service = new AuthService(prisma, jwt);
    (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});
  });

  it('register: yeni kullanıcı oluşturur ve token döner', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      role: 'USER',
    });

    const tokens = await service.register({
      email: 'A@B.com',
      password: 'password123',
    });

    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'a@b.com' }),
      }),
    );
  });

  it('register: mevcut e-postada ConflictException fırlatır', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1' });
    await expect(
      service.register({ email: 'a@b.com', password: 'password123' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login: doğru şifrede token döner', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      role: 'USER',
      active: true,
      passwordHash,
    });

    const tokens = await service.login({
      email: 'a@b.com',
      password: 'password123',
    });
    expect(tokens.accessToken).toBeTruthy();
  });

  it('login: yanlış şifrede UnauthorizedException fırlatır', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      role: 'USER',
      active: true,
      passwordHash,
    });

    await expect(
      service.login({ email: 'a@b.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh: geçerli tokenı döndürür ve eskisini iptal eder', async () => {
    const refreshToken = jwt.sign(
      { sub: 'u1', email: 'a@b.com', role: 'USER' },
      { secret: 'test-refresh', expiresIn: '7d' },
    );
    (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'rt1',
      userId: 'u1',
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      role: 'USER',
      active: true,
    });

    const tokens = await service.refresh(refreshToken);
    expect(tokens.refreshToken).toBeTruthy();
    expect(prisma.refreshToken.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'rt1' } }),
    );
  });

  it('refresh: iptal edilmiş tokenı reddeder (reuse)', async () => {
    const refreshToken = jwt.sign(
      { sub: 'u1', email: 'a@b.com', role: 'USER' },
      { secret: 'test-refresh', expiresIn: '7d' },
    );
    (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
      id: 'rt1',
      userId: 'u1',
      tokenHash: hashToken(refreshToken),
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(service.refresh(refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
  });

  it('refresh: geçersiz imzayı reddeder', async () => {
    await expect(service.refresh('not-a-jwt')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
