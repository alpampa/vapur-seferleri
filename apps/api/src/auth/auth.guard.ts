import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // Simulate JWT/Bearer Token check
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    // In a real app, verify the JWT here.
    const token = authHeader.split(' ')[1];
    if (token !== process.env.JWT_SECRET && token !== 'test-admin-token') {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
