import React from 'react';
import SimpleListTab from './SimpleListTab';

const CirconstancesTab = ({ showSuccessMessage, setErrorMessage, colors }) => {
  return (
    <SimpleListTab
      apiKey="circonstances"
      title="Circonstances"
      placeholder="Nouvelle circonstance..."
      showSuccessMessage={showSuccessMessage}
      setErrorMessage={setErrorMessage}
      colors={colors}
      canReorder={false}
    />
  );
};

export default CirconstancesTab;