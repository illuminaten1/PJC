import React from 'react';
import SimpleListTab from './SimpleListTab';

const DepartementsTab = ({ showSuccessMessage, setErrorMessage, colors }) => {
  return (
    <SimpleListTab
      apiKey="departements"
      title="Départements"
      placeholder="Nouveau département..."
      showSuccessMessage={showSuccessMessage}
      setErrorMessage={setErrorMessage}
      colors={colors}
      canReorder={true}
    />
  );
};

export default DepartementsTab;