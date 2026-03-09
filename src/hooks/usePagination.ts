import { useState } from 'react';

interface ConfigType {
  pageIndex?: number;
  itemPerPage?: number;
}

export default function usePagination<DataType>(data: Array<DataType>, defaultData?: ConfigType) {
  const pageIndex = defaultData?.pageIndex ?? 1;
  const itemPerPage = defaultData?.itemPerPage ?? 10;

  const [currentPage, setCurrentPage] = useState(pageIndex);
  const maxPage = Math.ceil(data.length / itemPerPage);

  function next() {
    setCurrentPage((currentPage) => Math.min(currentPage + 1, maxPage));
  }

  function prev() {
    setCurrentPage((currentPage) => Math.max(currentPage - 1, 1));
  }

  function jump(page: number) {
    const pageNumber = Math.max(1, page);
    setCurrentPage(Math.min(pageNumber, maxPage));
  }

  const _data = data.slice(currentPage * itemPerPage - itemPerPage, currentPage * itemPerPage);
  return { next, prev, jump, data: _data, currentPage, maxPage };
}
