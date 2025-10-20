import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}