import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { TasksModule } from '../tasks/tasks.module';
import { SeedModule } from '../seed/seed.module';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Task } from '../entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Organization, User, Task],
      synchronize: true,
      logging: false,
    }),
    AuthModule,
    AuditModule,
    TasksModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
