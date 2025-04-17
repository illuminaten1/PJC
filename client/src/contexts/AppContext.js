import { createContext } from 'react';

const AppContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {}
});

export default AppContext;