import { MDXProvider as BaseMDXProvider } from '@mdx-js/react';
import { WarningBox, HighlightBox, VariableGroup, VariableItem, FeatureCard, FeatureGrid, VariablesGrid } from './MdxComponents';

const components = {
  WarningBox,
  HighlightBox,
  VariableGroup,
  VariableItem,
  FeatureCard,
  FeatureGrid,
  VariablesGrid,
};

export const MDXProvider = ({ children }) => (
  <BaseMDXProvider components={components}>
    {children}
  </BaseMDXProvider>
);

export default MDXProvider;