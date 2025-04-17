import React, { useMemo } from 'react';
import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table';
import styled from 'styled-components';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaAngleLeft, FaAngleRight } from 'react-icons/fa';

const DataTable = ({ columns, data, onRowClick, searchPlaceholder = "Rechercher...", pageSize = 10 }) => {
  const columnsMemo = useMemo(() => columns, [columns]);
  const dataMemo = useMemo(() => data, [data]);
  
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setGlobalFilter,
    state: { pageIndex, globalFilter }
  } = useTable(
    { 
      columns: columnsMemo, 
      data: dataMemo,
      initialState: { pageIndex: 0, pageSize }
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );
  
  return (
    <TableContainer>
      <TableHeader>
        <SearchContainer>
          <FaSearch />
          <input
            value={globalFilter || ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </SearchContainer>
      </TableHeader>
      
      <StyledTable {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  <div>
                    {column.render('Header')}
                    <SortIcon>
                      {column.isSorted ? (
                        column.isSortedDesc ? <FaSortDown /> : <FaSortUp />
                      ) : (
                        <FaSort />
                      )}
                    </SortIcon>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map(row => {
            prepareRow(row);
            return (
              <tr 
                {...row.getRowProps()}
                onClick={() => onRowClick && onRowClick(row.original)}
                className={onRowClick ? 'clickable' : ''}
              >
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
      
      {pageCount > 1 && (
        <Pagination>
          <PaginationButton onClick={() => previousPage()} disabled={!canPreviousPage}>
            <FaAngleLeft />
          </PaginationButton>
          
          <PageInfo>
            Page <strong>{pageIndex + 1}</strong> sur {pageOptions.length}
          </PageInfo>
          
          <PaginationButton onClick={() => nextPage()} disabled={!canNextPage}>
            <FaAngleRight />
          </PaginationButton>
        </Pagination>
      )}
    </TableContainer>
  );
};

const TableContainer = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  padding: 16px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 4px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  
  svg {
    color: #757575;
    margin-right: 8px;
  }
  
  input {
    border: none;
    flex: 1;
    outline: none;
    font-size: 14px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 500;
    color: #333;
    
    div {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  
  tr.clickable {
    cursor: pointer;
    
    &:hover {
      background-color: rgba(63, 81, 181, 0.05);
    }
  }
`;

const SortIcon = styled.span`
  display: flex;
  align-items: center;
  color: #999;
  font-size: 14px;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid #eee;
  gap: 16px;
`;

const PaginationButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:not(:disabled):hover {
    background-color: #f5f5f5;
  }
`;

const PageInfo = styled.div`
  font-size: 14px;
`;

export default DataTable;