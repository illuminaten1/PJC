import React from 'react';
import SimpleListTab from './SimpleListTab';

const RegionsTab = ({ showSuccessMessage, setErrorMessage, colors }) => {
  return (
    <SimpleListTab
      apiKey="regions"
      title="Régions"
      placeholder="Nouvelle région..."
      showSuccessMessage={showSuccessMessage}
      setErrorMessage={setErrorMessage}
      colors={colors}
      canReorder={true}
    />
  );
};

export default RegionsTab;