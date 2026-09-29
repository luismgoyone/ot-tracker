import { Typography } from '@mui/material';

export const SectionLabel = ({ children }: { children: string }) => (
  <Typography
    variant="caption"
    fontWeight={700}
    color="text.secondary"
    letterSpacing="0.08em"
    textTransform="uppercase"
  >
    {children}
  </Typography>
);
