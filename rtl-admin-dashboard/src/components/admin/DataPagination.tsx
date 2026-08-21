import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function DataPagination({
  page = 1,
  totalPages = 5,
  onChange,
}: {
  page?: number;
  totalPages?: number;
  onChange?: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onChange?.(Math.max(1, page - 1));
            }}
          >
            قبلی
          </PaginationPrevious>
        </PaginationItem>
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === page}
              onClick={(e) => {
                e.preventDefault();
                onChange?.(p);
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onChange?.(Math.min(totalPages, page + 1));
            }}
          >
            بعدی
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
