import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleService } from './role.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { I18nServiceWrapper } from '../../i18n/i18n.service';
import { ControllerResponse } from '../../../common/interfaces/api-response.interface';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/roles.enum';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly i18n: I18nServiceWrapper,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<ControllerResponse> {
    const role = await this.roleService.create(createRoleDto);
    return {
      message: this.i18n.t('role', 'CREATED'),
      data: role,
    };
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<ControllerResponse> {
    const { roles, meta } = await this.roleService.findAll(
      query.page,
      query.limit,
    );
    return {
      message: this.i18n.t('role', 'LISTED'),
      data: roles,
      meta,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ControllerResponse> {
    const role = await this.roleService.findOne(id);
    return {
      message: this.i18n.t('role', 'FOUND'),
      data: role,
    };
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<ControllerResponse> {
    const role = await this.roleService.update(id, updateRoleDto);
    return {
      message: this.i18n.t('role', 'UPDATED'),
      data: role,
    };
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ControllerResponse> {
    await this.roleService.remove(id);
    return {
      message: this.i18n.t('role', 'DELETED'),
    };
  }
}
