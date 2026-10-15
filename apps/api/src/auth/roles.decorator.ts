import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Route'a erişebilecek rolleri tanımlar (ör. @Roles('ADMIN')). */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
