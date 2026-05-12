import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly storageService: StorageService,
  ) {}

  async findAll(page: number, limit: number) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const data = users.map((u) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = u;
      return rest;
    });
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    await this.userRepository.update(id, dto);
    return this.findOne(id);
  }

  async uploadAvatar(id: string, file: Express.Multer.File) {
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const key = `avatars/${id}/${Date.now()}.${ext}`;
    await this.storageService.upload(file, key);
    await this.userRepository.update(id, { avatar: key });
    const avatarUrl = await this.storageService.getSignedUrl(key);
    return { avatarUrl };
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.update(id, { role: dto.role });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.softDelete(id);
  }
}
