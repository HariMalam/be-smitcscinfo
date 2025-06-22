import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsArray()
  @IsString({ each: true })
  roles: string[];
}
