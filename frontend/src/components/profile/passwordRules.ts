/** Password length limits enforced by the API (bcrypt ignores anything past 72 bytes). */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

/** Client-side length check; returns an error message, or null when the length is valid. */
export const passwordLengthError = (password: string, label = 'Password'): string | null => {
  if (password.length < PASSWORD_MIN_LENGTH) return `${label} must be at least ${PASSWORD_MIN_LENGTH} characters`;
  if (password.length > PASSWORD_MAX_LENGTH) return `${label} must be at most ${PASSWORD_MAX_LENGTH} characters`;
  return null;
};

/** Validates a new password and its confirmation; returns an error message or null. */
export const newPasswordError = (newPassword: string, confirmPassword: string): string | null =>
  passwordLengthError(newPassword) ?? (newPassword !== confirmPassword ? 'Passwords do not match' : null);
