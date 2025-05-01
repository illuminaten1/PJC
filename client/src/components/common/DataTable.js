import React, { useState, useEffect, useContext } from 'react';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';
import styled from 'styled-components';
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { ThemeContext } from '../../contexts/ThemeContext';
const DataTable = ({
  columns,
  data,
  onRowClick,
  searchPlaceholder = "Rechercher...",
  initialState = {}
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [globalFilterTimeout, setGlobalFilterTimeout] = useState(null);
  const { darkMode } = useContext(ThemeContext); // Utilisation du contexte de thème
  
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
    <TableContainer darkMode={darkMode}>
      <SearchContainer darkMode={darkMode}>
        <SearchIconWrapper darkMode={darkMode}>
          <FaSearch />
        </SearchIconWrapper>
        <SearchInput
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={searchPlaceholder}
          darkMode={darkMode}
        />
      </SearchContainer>
      
      <TableWrapper>
        <StyledTable {...getTableProps()} darkMode={darkMode}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} darkMode={darkMode}>
                    <HeaderContent>
                      {column.render('Header')}
                      <SortIcon darkMode={darkMode}>
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
                    darkMode={darkMode}
                  >
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} darkMode={darkMode}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <EmptyMessage colSpan={columns.length} darkMode={darkMode}>
                  Aucun élément trouvé
                </EmptyMessage>
              </tr>
            )}
          </tbody>
        </StyledTable>
      </TableWrapper>
      
      <ResultCount darkMode={darkMode}>
        {rows.length} élément{rows.length !== 1 ? 's' : ''} trouvé{rows.length !== 1 ? 's' : ''}
      </ResultCount>
    </TableContainer>
  );
};

const TableContainer = styled.div`
  background-color: ${props => props.darkMode ? 'var(--color-surface)' : '#fff'};
  border-radius: 4px;
  box-shadow: var(--shadow-light);
  overflow: hidden;
  transition: background-color var(--transition-speed);
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9'};
  border-bottom: 1px solid ${props => props.darkMode ? 'var(--color-divider)' : '#eee'};
  position: relative;
  transition: background-color var(--transition-speed), border-color var(--transition-speed);
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 26px;
  color: ${props => props.darkMode ? 'var(--color-text-light)' : '#757575'};
  transition: color var(--transition-speed);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 16px 8px 36px;
  border: 1px solid ${props => props.darkMode ? 'var(--color-divider)' : '#ddd'};
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background-color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff'};
  color: ${props => props.darkMode ? 'var(--color-text)' : 'inherit'};
  
  &:focus {
    border-color: var(--color-primary);
  }
  
  &::placeholder {
    color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.3)' : '#aaa'};
  }
  
  transition: background-color var(--transition-speed), border-color var(--transition-speed), color var(--transition-speed);
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
    border-bottom: 1px solid ${props => props.darkMode ? 'var(--color-divider)' : '#eee'};
    color: ${props => props.darkMode ? 'var(--color-text)' : 'inherit'};
    transition: border-color var(--transition-speed), color var(--transition-speed);
  }
  
  th {
    background-color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9'};
    font-weight: 600;
    color: ${props => props.darkMode ? 'var(--color-text)' : '#333'};
    transition: background-color var(--transition-speed), color var(--transition-speed);
  }
  
  tbody tr {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5'};
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
  color: ${props => props.darkMode ? 'var(--color-text-light)' : '#757575'};
  transition: color var(--transition-speed);
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
  color: ${props => props.darkMode ? 'var(--color-text-light)' : '#757575'};
  transition: color var(--transition-speed);
`;

const ResultCount = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  background-color: ${props => props.darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9'};
  border-top: 1px solid ${props => props.darkMode ? 'var(--color-divider)' : '#eee'};
  font-size: 14px;
  color: ${props => props.darkMode ? 'var(--color-text-light)' : '#757575'};
  transition: background-color var(--transition-speed), border-color var(--transition-speed), color var(--transition-speed);
`;

export default DataTable;