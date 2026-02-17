import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { Permission } from '@secure-task/auth';
import type { CreateTaskDto, UpdateTaskDto } from '@secure-task/data';
import { TaskStatus, TaskCategory } from '@secure-task/data';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RequirePermission(Permission.TaskCreate)
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: JwtPayload) {
    return this.tasksService.create(dto, user);
  }

  @Get()
  @RequirePermission(Permission.TaskRead)
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('sort') sort?: string,
    @Query('category') category?: TaskCategory,
    @Query('status') status?: TaskStatus
  ) {
    return this.tasksService.findAll(user, sort, category, status);
  }

  @Get(':id')
  @RequirePermission(Permission.TaskRead)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.findOne(id, user);
  }

  @Put(':id')
  @RequirePermission(Permission.TaskUpdate)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.tasksService.update(id, dto, user);
  }

  @Delete(':id')
  @RequirePermission(Permission.TaskDelete)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.remove(id, user);
  }
}
