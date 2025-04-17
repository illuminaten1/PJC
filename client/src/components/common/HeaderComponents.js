import styled from 'styled-components';

export const HeaderCard = styled.div`
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 24px;
`;

export const HeaderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 16px;
  
  @media (min-width: 992px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const HeaderItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

export const HeaderLabel = styled.div`
  font-size: 14px;
  color: #757575;
  margin-bottom: 4px;
`;

export const HeaderValue = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

export const HeaderFullWidth = styled.div`
  grid-column: 1 / -1;
  margin-bottom: 16px;
`;

export const ArchiveNote = styled.div`
  font-size: 12px;
  color: #757575;
  margin-top: 4px;
  font-style: italic;
`;