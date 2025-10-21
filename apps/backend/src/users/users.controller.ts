import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/registrations')
  async getMyRegistrations(@CurrentUser() user: any) {
    return this.usersService.getUserRegistrations(user.id);
  }

  @Get('me/mailbox')
  async getMyMailbox(@CurrentUser() user: any) {
    return this.usersService.getUserMailbox(user.id);
  }
}