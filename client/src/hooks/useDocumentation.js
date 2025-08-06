import { useState, useEffect, useMemo } from 'react';

export const useDocumentation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Table des matières
  const tableOfContents = useMemo(() => [
    { id: 'introduction', label: 'Introduction' },
    { 
      id: 'structure-des-données', 
      label: 'Structure des données',
      children: [
        { id: 'affaires', label: 'Affaires' },
        { id: 'militaires', label: 'Militaires' },
        { id: 'bénéficiaires', label: 'Bénéficiaires' }
      ]
    },
    { id: 'fonctionnalités-principales', label: 'Fonctionnalités principales' },
    { 
      id: 'gestion-des-paramètres', 
      label: 'Gestion des paramètres',
      children: [
        { id: 'modification-des-circonstances', label: 'Modification des circonstances' },
        { id: 'modification-des-rédacteurs', label: 'Modification des rédacteurs' }
      ]
    },
    { 
      id: 'templates-de-documents', 
      label: 'Templates de documents',
      children: [
        { id: 'personnalisation-des-templates', label: 'Personnalisation des templates' },
        { id: 'variables-pour-les-conventions-dhonoraires', label: 'Variables conventions' },
        { id: 'variables-pour-les-fiches-de-règlement', label: 'Variables règlement' }
      ]
    }
  ], []);

  // Gestion du scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      updateActiveSection();
    };

    const updateActiveSection = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let current = '';
      
      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 150) {
          current = heading.id || heading.textContent?.toLowerCase().replace(/[^a-z0-9]/g, '-');
        }
      });
      
      if (current !== activeSection) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    updateActiveSection();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  // Navigation vers une section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      setShowMobileSidebar(false);
    }
  };

  // Retour en haut
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle sidebar mobile
  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  // Filtrage simple du contenu
  const filterContent = (term) => {
    setSearchTerm(term);
  };

  // Composant personnalisé pour les headings avec ID automatique
  const createHeading = (level) => ({ children, ...props }) => {
    const id = children?.toString().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const Tag = `h${level}`;
    return <Tag id={id} {...props}>{children}</Tag>;
  };

  return {
    searchTerm,
    setSearchTerm,
    activeSection,
    showScrollTop,
    showMobileSidebar,
    tableOfContents,
    scrollToSection,
    scrollToTop,
    toggleMobileSidebar,
    filterContent,
    createHeading
  };
};