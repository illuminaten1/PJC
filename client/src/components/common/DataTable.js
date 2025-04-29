import React, { useState, useEffect } from 'react';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';
import styled from 'styled-components';
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const DataTable = ({
  columns,
  data,
  onRowClick,
  searchPlaceholder = "Rechercher...",
  initialState = {}
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [globalFilterTimeout, setGlobalFilterTimeout] = useState(null);
  
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: { 
        ...initialState
      },
      autoResetGlobalFilter: false,
    },
    useGlobalFilter,
    useSortBy
  );

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
            {rows.length > 0 ? (
              rows.map((row, i) => {
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
              })
            ) : (
              <tr>
                <EmptyMessage colSpan={columns.length}>
                  Aucun élément trouvé
                </EmptyMessage>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableWrapper>
      
      <ResultCount>
        {rows.length} élément{rows.length !== 1 ? 's' : ''} trouvé{rows.length !== 1 ? 's' : ''}
      </ResultCount>
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
  width: 100%;
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

const EmptyMessage = styled.td`
  text-align: center;
  padding: 40px !important;
  color: #757575;
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

const ResultCount = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #757575;
`;

export default DataTable;