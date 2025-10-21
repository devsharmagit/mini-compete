import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Headers,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CompetitionsService } from './competition.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateCompetitionDto } from './dto/create-competition.dto';

@Controller('competitions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Post()
  @Roles('ORGANIZER')
  async create(
    @Body() createCompetitionDto: CreateCompetitionDto,
    @CurrentUser() user: any,
  ) {
    return this.competitionsService.create(createCompetitionDto, user.id);
  }

  @Get()
  @Public()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tags') tags?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const tagArray = tags ? tags.split(',') : undefined;

    return this.competitionsService.findAll(pageNum, limitNum, tagArray);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.competitionsService.findOne(id);
  }

  @Post(':id/register')
  @Roles('PARTICIPANT')
  async register(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.competitionsService.register(id, user.id, idempotencyKey);
  }

  @Get(':id/registrations')
  @Roles('ORGANIZER')
  async getRegistrations(@Param('id', ParseIntPipe) id: number) {
    return this.competitionsService.getRegistrations(id);
  }
}