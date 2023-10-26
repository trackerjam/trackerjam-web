type GenericSession = {
  startTime: number;
  endTime: number;
};

// Make dates human-readable
export function humanizeDates<T extends GenericSession>(session: T): T {
  const logSession = JSON.parse(JSON.stringify(session));
  if (typeof logSession.startTime === 'number') {
    logSession.startTime = new Date(logSession.startTime).toISOString();
  }
  if (typeof logSession.endTime === 'number') {
    logSession.endTime = new Date(logSession.endTime).toISOString();
  }
  return logSession;
}
