import { ConflictException, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { User } from './entites/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nServiceWrapper } from '../../i18n/i18n.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../role/entities/role.entity';
import { hashValue } from '../../../common/utils/bcrypt.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly i18n: I18nServiceWrapper,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: createUserDto.email }],
    });
    if (existingUser) {
      throw new ConflictException(this.i18n.t('auth', 'USER_ALREADY_EXISTS'));
    }
    const roles = await this.roleRepository.findBy({
      name: In(createUserDto.roles),
    });

    const user = new User();
    Object.assign(user, createUserDto);
    user.roles = roles;
    if (createUserDto.password) {
      user.password = await hashValue(createUserDto.password);
    }
    return await this.userRepository.save(user);
  }
}
