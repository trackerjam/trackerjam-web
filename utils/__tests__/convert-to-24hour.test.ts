import {convertTo24HourFormat} from '../convert-to-24hour';

describe('convertTo24HourFormat', () => {
  it('should convert PM times correctly', () => {
    expect(convertTo24HourFormat('2:30 pm')).toBe('14:30');
    expect(convertTo24HourFormat('12:00 pm')).toBe('12:00');
    expect(convertTo24HourFormat('5:15 PM')).toBe('17:15');
  });

  it('should convert AM times correctly', () => {
    expect(convertTo24HourFormat('2:30 am')).toBe('02:30');
    expect(convertTo24HourFormat('12:00 am')).toBe('00:00');
    expect(convertTo24HourFormat('5:15 AM')).toBe('05:15');
  });

  it('should handle 24-hour format input correctly', () => {
    expect(convertTo24HourFormat('14:30')).toBe('14:30');
    expect(convertTo24HourFormat('00:00')).toBe('00:00');
    expect(convertTo24HourFormat('05:15')).toBe('05:15');
  });

  it('should throw an error for invalid inputs', () => {
    expect(() => {
      convertTo24HourFormat('invalid input');
    }).toThrow('Invalid work time input format');
  });

  it('should correctly convert times where AM/PM is specified without a space', () => {
    expect(convertTo24HourFormat('2:30pm')).toBe('14:30');
    expect(convertTo24HourFormat('12:00pm')).toBe('12:00');
    expect(convertTo24HourFormat('5:15PM')).toBe('17:15');
    expect(convertTo24HourFormat('2:30am')).toBe('02:30');
    expect(convertTo24HourFormat('12:00am')).toBe('00:00');
    expect(convertTo24HourFormat('5:15AM')).toBe('05:15');
  });
});
