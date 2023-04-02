export function getProductInitials(name: string | undefined): string {
  let res = '';
  if (!name) {
    return res;
  }
  const nameArr = name.split(' ').filter(Boolean);
  res = nameArr[0][0].toUpperCase();
  if (nameArr.length > 1) {
    res += nameArr[1][0].toUpperCase();
  }

  return res;
}
