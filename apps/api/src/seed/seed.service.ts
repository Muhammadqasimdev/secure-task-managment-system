import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Role } from '@secure-task/data';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async onModuleInit() {
    const userCount = await this.userRepo.count();
    if (userCount > 0) return;
    const org = this.orgRepo.create({ name: 'Default Organization', parentId: null });
    const savedOrg = await this.orgRepo.save(org);
    const hash = await bcrypt.hash('admin123', 10);
    const users = [
      { email: 'admin@example.com', role: Role.Owner },
      { email: 'admin2@example.com', role: Role.Admin },
      { email: 'viewer@example.com', role: Role.Viewer },
    ];
    for (const u of users) {
      const user = this.userRepo.create({
        email: u.email,
        passwordHash: hash,
        role: u.role,
        organizationId: savedOrg.id,
      });
      await this.userRepo.save(user);
    }
    console.log('[Seed] Created default org and demo users (password: admin123): admin@example.com (Owner), admin2@example.com (Admin), viewer@example.com (Viewer)');
  }
}
