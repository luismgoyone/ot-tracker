import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  /** Required unless the user is replacing a temporary password. */
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt ignores anything past 72 bytes
  newPassword!: string;
}
