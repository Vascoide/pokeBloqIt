import { cn } from "../../libs/tailwindHelper";
interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const isPrevDisabled = isLoading || page === 1;
  const isNextDisabled = isLoading || page === totalPages;

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        disabled={isPrevDisabled}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 bg-black rounded disabled:opacity-40"
      >
        Prev
      </button>

      <span className={cn("font-semibold", isLoading && "opacity-60")}>
        {isLoading ? "Loading…" : `Page ${page} / ${totalPages}`}
      </span>

      <button
        disabled={isNextDisabled}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 bg-black rounded disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
