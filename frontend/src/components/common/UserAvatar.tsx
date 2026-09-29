import { Avatar, AvatarProps } from '@mui/material';
import { getInitials } from '../../utils/format';

interface UserAvatarProps extends Omit<AvatarProps, 'children'> {
  firstName?: string;
  lastName?: string;
  /** Stable id used to pick a colour, so a person keeps the same colour everywhere. */
  colorKey?: number;
  size?: number;
}

export const UserAvatar = ({ firstName, lastName, colorKey = 0, size = 32, sx, ...props }: UserAvatarProps) => (
  <Avatar
    sx={{
      width: size,
      height: size,
      fontSize: size * 0.34,
      fontWeight: 700,
      bgcolor: (theme) => theme.palette.series[Math.abs(colorKey) % theme.palette.series.length],
      flexShrink: 0,
      ...sx,
    }}
    {...props}
  >
    {getInitials(firstName, lastName)}
  </Avatar>
);
