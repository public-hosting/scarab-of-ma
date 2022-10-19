import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'lib/flatMap';
import { Root } from './pages/Root/Root';
import { clearPersistedState } from './hooks/useStatePersist';

const url = new URL(location.href);
const shouldReload = Boolean(url.searchParams.get('reload'));
if (shouldReload) {
  clearPersistedState();
  url.searchParams.delete('reload');
  location.href = url.href;
}

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
