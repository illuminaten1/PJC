import React, { useState, useEffect, useCallback } from 'react';
import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table';
import styled from 'styled-components';
import { FaSearch, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const DataTable = ({
  columns,
  data,
  onRowClick,
  searchPlaceholder = "Rechercher...",
  initialState = {}
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [globalFilterTimeout, setGlobalFilterTimeout] = useState(null);
  
  // État pour la sélection du nombre de lignes (ajout de l'option "Tout")
  const [pageSize, setPageSize] = useState(initialState.pageSize || 10);
  const [showAll, setShowAll] = useState(false);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    setGlobalFilter,
    state: { globalFilter, pageIndex },
    gotoPage,
    previousPage,
    nextPage,
    canPreviousPage,
    canNextPage,
    pageCount,
    setPageSize: setReactTablePageSize,
    pageOptions,
  } = useTable(
    {
      columns,
      data,
      initialState: { 
        ...initialState,
        pageSize: showAll ? data.length : pageSize
      },
      autoResetGlobalFilter: false,
      disablePagination: showAll,
      autoResetPage: false,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // Mettre à jour la taille de page dans react-table quand pageSize ou showAll change
  useEffect(() => {
    if (showAll) {
      setReactTablePageSize(data.length);
    } else {
      setReactTablePageSize(pageSize);
    }
  }, [pageSize, showAll, data.length, setReactTablePageSize]);

  // Gérer la recherche avec debounce
  useEffect(() => {
    if (globalFilterTimeout) {
      clearTimeout(globalFilterTimeout);
    }
    
    const timeoutId = setTimeout(() => {
      setGlobalFilter(searchValue || undefined);
    }, 300);
    
    setGlobalFilterTimeout(timeoutId);
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchValue, setGlobalFilter]);

  // Gérer le changement de l'affichage de toutes les lignes
  const handlePageSizeChange = (e) => {
    const value = e.target.value;
    if (value === 'all') {
      setShowAll(true);
    } else {
      setShowAll(false);
      setPageSize(Number(value));
    }
    gotoPage(0);
  };

  return (
    <TableContainer>
      <SearchContainer>
        <SearchIconWrapper>
          <FaSearch />
        </SearchIconWrapper>
        <SearchInput
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </SearchContainer>
      
      <TableWrapper>
        <StyledTable {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    <HeaderContent>
                      {column.render('Header')}
                      <SortIcon>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? <FaSortDown />
                            : <FaSortUp />
                          : <FaSort />}
                      </SortIcon>
                    </HeaderContent>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className="clickable-row"
                >
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </StyledTable>
      </TableWrapper>
      
      {!showAll && pageCount > 1 && (
        <PaginationContainer>
          <PageSizeSelector>
            <span>Lignes par page:</span>
            <Select value={showAll ? 'all' : pageSize} onChange={handlePageSizeChange}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="all">Tout</option>
            </Select>
          </PageSizeSelector>
          
          <PaginationInfo>
            Page {pageIndex + 1} sur {pageOptions.length} 
            {!showAll && ` (${data.length} lignes au total)`}
          </PaginationInfo>
          
          <PaginationButtons>
            <PaginationButton
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
              title="Première page"
            >
              <FaAngleDoubleLeft />
            </PaginationButton>
            <PaginationButton
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              title="Page précédente"
            >
              <FaChevronLeft />
            </PaginationButton>
            <PaginationButton
              onClick={() => nextPage()}
              disabled={!canNextPage}
              title="Page suivante"
            >
              <FaChevronRight />
            </PaginationButton>
            <PaginationButton
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
              title="Dernière page"
            >
              <FaAngleDoubleRight />
            </PaginationButton>
          </PaginationButtons>
        </PaginationContainer>
      )}

      {showAll && (
        <PaginationContainer>
          <PageSizeSelector>
            <span>Lignes par page:</span>
            <Select value="all" onChange={handlePageSizeChange}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="all">Tout</option>
            </Select>
          </PageSizeSelector>
          
          <PaginationInfo>
            Affichage de toutes les {data.length} lignes
          </PaginationInfo>
          
          <div style={{ width: '120px' }}></div> {/* Espace pour équilibrer le layout */}
        </PaginationContainer>
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

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
  position: relative;
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 26px;
  color: #757575;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 16px 8px 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #3f51b5;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  max-height: 70vh;
  overflow-y: auto;
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
    background-color: #f9f9f9;
    font-weight: 600;
    color: #333;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  
  tbody tr {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f5f5f5;
    }
    
    &:last-child td {
      border-bottom: none;
    }
    
    &.clickable-row {
      cursor: pointer;
    }
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SortIcon = styled.span`
  margin-left: 8px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #757575;
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
`;

const PageSizeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #757575;
`;

const Select = styled.select`
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #3f51b5;
  }
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #757575;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const PaginationButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  
  &:hover:not(:disabled) {
    background-color: #f0f0f0;
    border-color: #bbb;
  }
  
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

export default DataTable;