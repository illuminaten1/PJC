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
                      <td {...cell.getCellProps()} data-label={cell.column.Header}>
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
  -webkit-overflow-scrolling: touch;
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

  /* Responsive: Mobile Card Layout */
  @media (max-width: 768px) {
    display: block;
    
    thead {
      display: none;
    }
    
    tbody {
      display: block;
      background: ${props => props.colors.surfaceHover}20;
      padding: 16px;
      border-radius: 8px;
    }
    
    tr {
      display: block;
      margin-bottom: 20px;
      background: ${props => props.colors.surface};
      border: 2px solid ${props => props.colors.border};
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      
      /* Ligne de séparation décorative en haut */
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 20px;
        right: 20px;
        height: 3px;
        background: linear-gradient(90deg, ${props => props.colors.primary}, ${props => props.colors.primary}80);
        border-radius: 0 0 2px 2px;
      }
      
      &:hover {
        background-color: ${props => props.colors.surfaceHover};
        transform: translateY(-3px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        border-color: ${props => props.colors.primary}40;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: left;
      border: none;
      padding: 8px 0;
      border-bottom: 1px solid ${props => props.colors.borderLight};
      
      &:last-child {
        border-bottom: none;
      }
      
      &:before {
        content: attr(data-label);
        font-weight: 600;
        color: ${props => props.colors.textSecondary};
        flex: 0 0 40%;
        margin-right: 16px;
      }
      
      /* Contenu de la cellule */
      > * {
        flex: 1;
        text-align: right;
      }
    }
  }

  /* Responsive: Tablet */
  @media (max-width: 1024px) and (min-width: 769px) {
    th, td {
      padding: 10px 12px;
      font-size: 14px;
    }
  }
`;

const EmptyMessage = styled.td`
  text-align: center;
  padding: 40px !important;
  color: ${props => props.colors.textMuted};
  transition: color 0.3s ease;
  
  @media (max-width: 768px) {
    &:before {
      display: none;
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
  
  @media (max-width: 768px) {
    justify-content: center;
    padding: 16px;
  }
`;

export default DataTable;