import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Root } from './pages/Root/Root';

const rootNode = document.getElementById('root');
if (!rootNode) {
  throw new Error('Root dom node was not found');
}
const root = createRoot(rootNode);

root.render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
