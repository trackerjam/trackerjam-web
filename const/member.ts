export enum DAY {
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  SUN = 'sun',
}

export const DAY_ORDER: {
  [day: string]: number;
} = {
  [DAY.MON]: 0,
  [DAY.TUE]: 1,
  [DAY.WED]: 2,
  [DAY.THU]: 3,
  [DAY.FRI]: 4,
  [DAY.SAT]: 5,
  [DAY.SUN]: 6,
};
