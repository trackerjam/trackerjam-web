type GenericSession = {
  startTime: number | string;
  endTime: number | string;
};

// Make dates human-readable
export function humanizeDates<T extends GenericSession>(session: T): T {
  const logSession = JSON.parse(JSON.stringify(session));
  if (logSession.startTime) {
    logSession.startTime = new Date(logSession.startTime).toISOString();
  }
  if (logSession.endTime) {
    logSession.endTime = new Date(logSession.endTime).toISOString();
  }
  return logSession;
}
