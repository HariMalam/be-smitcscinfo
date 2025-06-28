import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../api/role/entities/role.entity';
import { User } from '../../api/user/entites/user.entity';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';
import { hashValue } from '../../../common/utils/bcrypt.util';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  async runSeeders() {
    if (!this.configService.get<boolean>('runSeeders')) {
      this.logger.warn('🚨 RUN_SEEDERS=false. Skipping all seeding.');
      return;
    }
    this.logger.log('✅ RUN_SEEDERS=true. Seeding database...');
    await this.seedRoles();
    await this.seedSuperAdmin();
  }

  private async seedRoles() {
    const defaultRoles = ['super-admin', 'admin', 'default'];

    for (const roleName of defaultRoles) {
      const exists = await this.roleRepository.findOne({
        where: { name: roleName },
      });
      if (exists) return;
      const role = this.roleRepository.create({
        name: roleName,
      });
      await this.roleRepository.save(role);
      this.logger.log(`🟢 Created role: ${roleName}`);
    }
  }

  private async seedSuperAdmin() {
    const config =
      this.configService.get<AppConfig['superAdmin']>('superAdmin');

    if (!config) {
      this.logger.warn(
        '⚠️ Super admin configuration is missing. Skipping seeding.',
      );
      return;
    }

    const { email, password, name } = config;

    if (!email || !password || !name) {
      this.logger.warn(
        '⚠️ Incomplete super admin configuration. Skipping seeding.',
      );
      return;
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) return;

    const roles = await this.roleRepository.find({
      where: [{ name: 'super-admin' }, { name: 'admin' }, { name: 'default' }],
    });

    const hashedPassword = await hashValue(password);

    const user = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      roles,
    });

    await this.userRepository.save(user);
    this.logger.log(`🟢 Created super admin user: ${email}`);
  }
}
