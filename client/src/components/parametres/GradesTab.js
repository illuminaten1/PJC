import React from 'react';
import SimpleListTab from './SimpleListTab';

const GradesTab = ({ showSuccessMessage, setErrorMessage, colors }) => {
  return (
    <SimpleListTab
      apiKey="grades"
      title="Grades"
      placeholder="Nouveau grade..."
      showSuccessMessage={showSuccessMessage}
      setErrorMessage={setErrorMessage}
      colors={colors}
      canReorder={true}
    />
  );
};

export default GradesTab;