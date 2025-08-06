import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { FaBook, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useDocumentation } from '../hooks/useDocumentation';
import PageHeader from '../components/common/PageHeader';
import { documentationContent } from '../data/documentationContent';

const Documentation = () => {
  const { colors } = useTheme();
  const {
    searchTerm,
    activeSection,
    showScrollTop,
    showMobileSidebar,
    tableOfContents,
    scrollToSection,
    scrollToTop,
    toggleMobileSidebar,
    filterContent,
    createHeading
  } = useDocumentation();

  return (
    <Container colors={colors}>
      <PageHeader 
        title="Documentation"
        subtitle="Guide d'utilisation de l'application de Protection Juridique Complémentaire"
        backButton
      />

      <DocumentationLayout>
        <MobileSidebarToggle 
          onClick={toggleMobileSidebar}
          colors={colors}
        >
          {showMobileSidebar ? <FaTimes /> : <FaBars />}
          <span>Sommaire</span>
        </MobileSidebarToggle>

        <SidebarOverlay 
          isOpen={showMobileSidebar} 
          onClick={() => toggleMobileSidebar()}
          colors={colors}
        />
        
        <Sidebar colors={colors} isOpen={showMobileSidebar}>
          <SidebarContent>
            <SidebarHeader>
              <SidebarTitle colors={colors}>
                <FaBook style={{ marginRight: '8px' }} />
                Sommaire
              </SidebarTitle>
              
              <MobileCloseButton 
                onClick={() => toggleMobileSidebar()}
                colors={colors}
              >
                <FaTimes />
              </MobileCloseButton>
            </SidebarHeader>
            
            <SearchBox>
              <SearchIcon colors={colors}>
                <FaSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Rechercher dans la documentation..."
                value={searchTerm}
                onChange={(e) => filterContent(e.target.value)}
                colors={colors}
              />
            </SearchBox>
            
            <TableOfContents>
              {tableOfContents.map(item => (
                <TocItem key={item.id}>
                  <TocLink 
                    active={activeSection === item.id}
                    onClick={() => scrollToSection(item.id)}
                    colors={colors}
                  >
                    {item.label}
                  </TocLink>
                  {item.children && (
                    <SubMenu>
                      {item.children.map(child => (
                        <TocItem key={child.id}>
                          <TocLink 
                            active={activeSection === child.id}
                            onClick={() => scrollToSection(child.id)}
                            colors={colors}
                            submenu={true}
                          >
                            {child.label}
                          </TocLink>
                        </TocItem>
                      ))}
                    </SubMenu>
                  )}
                </TocItem>
              ))}
            </TableOfContents>
          </SidebarContent>
        </Sidebar>

        <Content colors={colors}>
          <ReactMarkdown
            components={{
              h1: createHeading(1),
              h2: createHeading(2),
              h3: createHeading(3),
              h4: createHeading(4),
              h5: createHeading(5),
              h6: createHeading(6),
              blockquote: ({ children }) => (
                <WarningBox colors={colors}>{children}</WarningBox>
              ),
              code: ({ children, inline }) => {
                if (inline) {
                  return <InlineCode colors={colors}>{children}</InlineCode>;
                }
                return <CodeBlock colors={colors}>{children}</CodeBlock>;
              }
            }}
          >
            {documentationContent}
          </ReactMarkdown>
        </Content>
      </DocumentationLayout>

      {showScrollTop && (
        <ScrollToTopButton onClick={scrollToTop} colors={colors}>
          ↑
        </ScrollToTopButton>
      )}
    </Container>
  );
};

// Styles compacts mais complets
const Container = styled.div`
  padding: 20px;
  background-color: ${props => props.colors.background};
  min-height: 100vh;
  @media (max-width: 768px) { padding: 10px; }
`;

const DocumentationLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  @media (max-width: 968px) { grid-template-columns: 1fr; }
`;

const MobileSidebarToggle = styled.button`
  display: none;
  align-items: center;
  gap: 8px;
  background: ${props => props.colors.surface};
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  cursor: pointer;
  color: ${props => props.colors.textPrimary};
  @media (max-width: 968px) { display: flex; }
`;

const SidebarOverlay = styled.div`
  display: none;
  @media (max-width: 968px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 998;
  }
`;

const Sidebar = styled.nav`
  background: ${props => props.colors.surface};
  border-radius: 8px;
  border: 1px solid ${props => props.colors.border};
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow: hidden;
  @media (max-width: 968px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 400px;
    z-index: 999;
    opacity: ${props => props.isOpen ? 1 : 0};
    visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  }
`;

const SidebarContent = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SidebarTitle = styled.h3`
  font-size: 18px;
  margin: 0;
  color: ${props => props.colors.textPrimary};
  border-bottom: 2px solid ${props => props.colors.primary};
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  flex: 1;
`;

const MobileCloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.colors.textSecondary};
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  @media (max-width: 968px) { display: flex; }
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.colors.textSecondary};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 6px;
  background: ${props => props.colors.surface};
  color: ${props => props.colors.textPrimary};
  &:focus {
    outline: none;
    border-color: ${props => props.colors.primary};
  }
`;

const TableOfContents = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TocItem = styled.li`
  margin-bottom: 4px;
`;

const TocLink = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: ${props => props.submenu ? '6px 12px' : '8px 12px'};
  color: ${props => props.active ? 'white' : props.colors.textSecondary};
  background: ${props => props.active ? props.colors.primary : 'transparent'};
  border: none;
  border-radius: 4px;
  font-size: ${props => props.submenu ? '13px' : '14px'};
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background: ${props => props.colors.primary};
    color: white;
  }
`;

const SubMenu = styled.ul`
  list-style: none;
  margin-left: 16px;
  padding: 0;
`;

const Content = styled.main`
  background: ${props => props.colors.surface};
  border-radius: 8px;
  border: 1px solid ${props => props.colors.border};
  padding: 32px;
  
  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.colors.textPrimary};
    margin-top: 2em;
    margin-bottom: 1em;
  }
  
  h1 {
    font-size: 2.5em;
    border-bottom: 3px solid ${props => props.colors.primary};
    padding-bottom: 0.5em;
  }
  
  h2 {
    font-size: 2em;
    border-bottom: 2px solid ${props => props.colors.primary};
    padding-bottom: 0.3em;
  }
  
  h3 {
    font-size: 1.5em;
    position: relative;
    padding-left: 16px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background: ${props => props.colors.primary};
      border-radius: 2px;
    }
  }
  
  p, li {
    color: ${props => props.colors.textPrimary};
    line-height: 1.7;
  }
  
  ul, ol {
    margin-left: 2em;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const WarningBox = styled.div`
  background: ${props => props.colors.surfaceHover};
  border-left: 4px solid ${props => props.colors.primary};
  padding: 16px 20px;
  margin: 20px 0;
  border-radius: 0 8px 8px 0;
  
  p {
    margin: 0;
    color: ${props => props.colors.textPrimary};
  }
`;

const InlineCode = styled.code`
  background: ${props => props.colors.surfaceHover};
  color: ${props => props.colors.textPrimary};
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
`;

const CodeBlock = styled.pre`
  background: ${props => props.colors.surfaceHover};
  color: ${props => props.colors.textPrimary};
  padding: 12px;
  border-radius: 6px;
  font-family: monospace;
  overflow-x: auto;
`;

const ScrollToTopButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: ${props => props.colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  font-size: 18px;
  z-index: 100;
  &:hover {
    transform: scale(1.1);
  }
`;

export default Documentation;