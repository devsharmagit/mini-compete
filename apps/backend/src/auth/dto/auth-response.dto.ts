import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class AuthResponseDto {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
}
