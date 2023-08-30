interface SingleCards {
  value: string | number | null | undefined;
  title: string;
}
export function SingleCards({title, value}: SingleCards) {
  return (
    <div className="flex flex-col items-center justify-center border-2 shadow p-4 rounded-xl gap-2 min-w-[160px]">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-gray-600 text-22 font-bold">{value ?? '...'}</div>
    </div>
  );
}
