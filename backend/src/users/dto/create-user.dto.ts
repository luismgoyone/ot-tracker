import { IsEmail, IsEnum, IsNumber, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  temporaryPassword!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsNumber()
  departmentId!: number;
}
