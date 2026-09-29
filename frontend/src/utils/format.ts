import dayjs from 'dayjs';

/** 2.5 -> "2h 30m" */
export const formatDuration = (hours: number) => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
};

/** "18:00:00" -> "18:00" */
export const formatTime = (time: string) => time.slice(0, 5);

export const formatDate = (date: string, pattern = 'MMM DD, YYYY') => dayjs(date).format(pattern);

export const getInitials = (firstName = '', lastName = '') =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

export const fullName = (user?: { firstName: string; lastName: string } | null) =>
  user ? `${user.firstName} ${user.lastName}` : '';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Month label for charts; adds the year when the range spans more than one. */
export const monthLabel = (month: number, year: number, showYear: boolean) =>
  showYear ? `${MONTHS[month - 1]} '${String(year).slice(-2)}` : MONTHS[month - 1];

/** Hours between two HH:mm times, crossing midnight if the end is earlier (mirrors the API). */
export const hoursBetween = (start: string, end: string) => {
  if (!start || !end) return 0;
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  let minutes = toMinutes(end) - toMinutes(start);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 100) / 100;
};
