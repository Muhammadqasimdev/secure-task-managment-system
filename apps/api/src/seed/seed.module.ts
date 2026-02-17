import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, User]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
