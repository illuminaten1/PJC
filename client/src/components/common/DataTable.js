import React, { useState, useEffect } from 'react';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';
import styled from 'styled-components';
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const DataTable = ({
  columns,
  data,
  onRowClick,
  searchPlaceholder = "Rechercher...",
  initialState = {}
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [globalFilterTimeout, setGlobalFilterTimeout] = useState(null);
  const { colors } = useTheme();
  
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
    <TableContainer colors={colors}>
      <SearchContainer colors={colors}>
        <SearchIconWrapper colors={colors}>
          <FaSearch />
        </SearchIconWrapper>
        <SearchInput
          colors={colors}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </SearchContainer>
      
      <TableWrapper>
        <StyledTable colors={colors} {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    <HeaderContent>
                      {column.render('Header')}
                      <SortIcon colors={colors}>
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
                <EmptyMessage colors={colors} colSpan={columns.length}>
                  Aucun élément trouvé
                </EmptyMessage>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableWrapper>
      
      <ResultCount colors={colors}>
        {rows.length} élément{rows.length !== 1 ? 's' : ''} trouvé{rows.length !== 1 ? 's' : ''}
      </ResultCount>
    </TableContainer>
  );
};

const TableContainer = styled.div`
  background-color: ${props => props.colors.surface};
  border-radius: 4px;
  box-shadow: ${props => props.colors.shadow};
  overflow: hidden;
  border: 1px solid ${props => props.colors.border};
  transition: all 0.3s ease;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.colors.surfaceHover};
  border-bottom: 1px solid ${props => props.colors.borderLight};
  position: relative;
  transition: all 0.3s ease;
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 26px;
  color: ${props => props.colors.textMuted};
  transition: color 0.3s ease;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 16px 8px 36px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background-color: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.colors.textMuted};
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
    border-bottom: 1px solid ${props => props.colors.borderLight};
    color: ${props => props.colors.textPrimary};
    transition: all 0.3s ease;
  }
  
  th {
    background-color: ${props => props.colors.surfaceHover};
    font-weight: 600;
    color: ${props => props.colors.textPrimary};
  }
  
  tbody tr {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: ${props => props.colors.surfaceHover};
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
  color: ${props => props.colors.textMuted};
  transition: color 0.3s ease;
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
  color: ${props => props.colors.textMuted};
  transition: color 0.3s ease;
`;

const ResultCount = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  background-color: ${props => props.colors.surfaceHover};
  border-top: 1px solid ${props => props.colors.borderLight};
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
  transition: all 0.3s ease;
`;

export default DataTable;