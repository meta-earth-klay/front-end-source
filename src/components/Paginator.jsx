import {
  Pagination, PaginationContainer, PaginationNext,
  PaginationPage, PaginationPageGroup, PaginationPrevious, usePagination
} from "@ajna/pagination";
import { Flex, Select, Text } from "@chakra-ui/react";
import React from "react";

export default function Paginator({ total, onPageChange, onPageSizeChange }) {
  const {
    currentPage,
    setCurrentPage,
    setPageSize,
    pagesCount,
    pages
  } = usePagination({
    total: total,
    initialState: { currentPage: 1, pageSize: 5 },
    limits: {
      outer: 1,
      inner: 1,
    }
  });
  const handlePageSizeChange = (event) => {
    const pageSize = Number(event.target.value);
    setPageSize(pageSize);
    onPageSizeChange(pageSize);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    onPageChange(page);
  };
  return (
    <Flex>
      <Pagination
        pagesCount={pagesCount}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      >
        <PaginationContainer>
          <PaginationPrevious size="sm" fontWeight="extrabold" mr="1" variant="outline">{'<'}</PaginationPrevious>
          <PaginationPageGroup>
            {pages.map((page) => (
              <PaginationPage size="sm"
                key={`pagination_page_${page}`}
                fontWeight={page === currentPage ? 'extrabold' : 'light'}
                page={page}
                mx="1"
                px="1"
                variant="outline"
              />
            ))}
          </PaginationPageGroup>
          <PaginationNext size="sm" fontWeight="extrabold" ml="1" variant="outline">{'>'}</PaginationNext>
        </PaginationContainer>
      </Pagination>
      <Select ml={3} onChange={handlePageSizeChange} w={20} size="sm">
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
      </Select>
    </Flex>
  );
};