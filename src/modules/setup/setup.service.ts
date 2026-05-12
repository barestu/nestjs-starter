import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserRole } from '../../common/enums/role.enum';
import { User } from '../../database/entities/user.entity';
import { SetupDto } from './dto/setup.dto';

@Injectable()
export class SetupService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createAdmin(dto: SetupDto): Promise<{ message: string }> {
    const adminExists = await this.userRepository.existsBy({
      role: UserRole.ADMIN,
    });
    if (adminExists) {
      throw new HttpException('Setup already completed', HttpStatus.GONE);
    }

    const password = await bcrypt.hash(dto.password, 10);
    await this.userRepository.save(
      this.userRepository.create({
        email: dto.email,
        password,
        role: UserRole.ADMIN,
        isVerified: true,
      }),
    );

    return { message: 'Admin account created' };
  }
}
