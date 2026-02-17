import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: ['organization'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: ['organization'],
    });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    role: string;
    organizationId: string;
  }): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }
}
