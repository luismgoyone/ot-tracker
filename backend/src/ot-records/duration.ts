import { BadRequestException } from '@nestjs/common';

export const MIN_OT_HOURS = 0.25;
export const MAX_OT_HOURS = 12;

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Hours between two HH:mm times. An end time at or before the start time is treated
 * as crossing midnight (e.g. 22:00 -> 02:00 is 4 hours).
 */
export function calculateOtHours(startTime: string, endTime: string): number {
  let minutes = toMinutes(endTime) - toMinutes(startTime);
  if (minutes <= 0) minutes += 24 * 60;
  const hours = Math.round((minutes / 60) * 100) / 100;

  if (hours < MIN_OT_HOURS || hours > MAX_OT_HOURS) {
    throw new BadRequestException(`Overtime must be between ${MIN_OT_HOURS} and ${MAX_OT_HOURS} hours`);
  }
  return hours;
}
