export type PerfMarkType = {
  markName: string;
  durationMs: number;
  totalMs: number;
  [key: string]: string | number | boolean;
};

export type ObjectPerfMarkType = Record<string, number | string | boolean>;

type TagsType = Record<string, string | number | boolean>;
export class PerfMarks {
  startTime: number;
  lastMarkTime: number;
  logs: PerfMarkType[];
  tags: TagsType | undefined;

  constructor(tags?: TagsType) {
    this.startTime = 0;
    this.lastMarkTime = 0;
    this.logs = [];
    this.tags = tags;
  }

  start() {
    this.startTime = performance.now();
    this.lastMarkTime = this.startTime;
  }

  mark(markName: string, props: Record<string, string | number | boolean> = {}) {
    const now = performance.now();
    const segmentTime = now - this.lastMarkTime;
    const totalTime = now - this.startTime;
    this.logs.push({markName, durationMs: segmentTime, totalMs: totalTime, ...props});
    this.lastMarkTime = now;
  }

  getLogs() {
    return this.logs;
  }

  getObjectLogs() {
    let res = this.logs.reduce((acc, log) => {
      acc[log.markName] = log.durationMs;
      return acc;
    }, {} as ObjectPerfMarkType);

    if (this.tags) {
      res = {
        ...res,
        ...this.tags,
      };
    }

    return res;
  }
}
