interface SingleCards {
  value: string | number | null | undefined;
  title: string;
}
export function SingleCard({title, value}: SingleCards) {
  let finalValue = value;
  if (
    (typeof finalValue === 'number' && isNaN(finalValue as number)) ||
    finalValue === null ||
    finalValue === undefined ||
    finalValue === ''
  ) {
    finalValue = '...';
  }

  return (
    <div className="flex flex-col items-center justify-center border-2 shadow p-4 rounded-xl gap-2 min-w-[160px]">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-gray-600 text-22 font-bold">{finalValue}</div>
    </div>
  );
}
