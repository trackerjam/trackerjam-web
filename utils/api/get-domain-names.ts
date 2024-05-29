import prismadb from '../../lib/prismadb';

export async function getDomainNamesByIds(ids: string[]) {
  const domainRecords = await prismadb.domain.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      domain: true,
      id: true,
    },
  });

  const domainMap: {[id: string]: string} = {};
  domainRecords.forEach((record) => {
    domainMap[record.id] = record.domain;
  });

  return domainMap;
}
