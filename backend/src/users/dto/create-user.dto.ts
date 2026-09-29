import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  temporaryPassword!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lastName!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsInt()
  departmentId!: number;
}
