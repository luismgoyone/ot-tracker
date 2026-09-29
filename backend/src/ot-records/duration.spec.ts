import { BadRequestException } from '@nestjs/common';
import { calculateOtHours } from './duration';

describe('calculateOtHours', () => {
  it('computes hours between two times', () => {
    expect(calculateOtHours('18:00', '20:30')).toBe(2.5);
    expect(calculateOtHours('17:15', '17:30')).toBe(0.25);
  });

  it('accepts times with seconds', () => {
    expect(calculateOtHours('18:00:00', '19:00:00')).toBe(1);
  });

  it('treats an end time before the start as crossing midnight', () => {
    expect(calculateOtHours('22:00', '02:00')).toBe(4);
  });

  it('rounds to two decimals', () => {
    expect(calculateOtHours('18:00', '18:20')).toBe(0.33);
  });

  it.each([
    ['under 15 minutes', '18:00', '18:10'],
    ['over 12 hours', '06:00', '19:00'],
    ['identical times (24 hours)', '18:00', '18:00'],
  ])('rejects %s', (_label, start, end) => {
    expect(() => calculateOtHours(start, end)).toThrow(BadRequestException);
  });
});
