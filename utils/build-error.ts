export function buildError(errorMsg: string) {
  return {
    status: 'error',
    errorMsg,
  };
}
