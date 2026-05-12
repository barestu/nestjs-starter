import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SetupDto } from './dto/setup.dto';
import { SetupService } from './setup.service';

@ApiTags('setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @ApiOperation({ summary: 'Create initial admin user (one-time)' })
  @Post()
  createAdmin(@Body() dto: SetupDto) {
    return this.setupService.createAdmin(dto);
  }
}
