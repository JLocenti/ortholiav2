import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

try {
  root.render(<App />);
} catch (error) {
  console.error('Error rendering app:', error);
  rootElement.innerHTML = '<div>Une erreur est survenue lors du chargement de l\'application.</div>';
}