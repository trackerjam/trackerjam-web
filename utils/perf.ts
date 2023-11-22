export type PerfMark = {
  markName: string;
  durationMs: number;
  totalMs: number;
};
export class PerformanceMeasure {
  startTime: number;
  lastMarkTime: number;
  logs: PerfMark[];

  constructor() {
    this.startTime = 0;
    this.lastMarkTime = 0;
    this.logs = [];
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
}
