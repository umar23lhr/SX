import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

console.log('App Mounted');
const debugDiv = document.createElement('div');
debugDiv.style.position = 'fixed';
debugDiv.style.bottom = '0';
debugDiv.style.right = '0';
debugDiv.style.background = 'blue';
debugDiv.style.color = 'white';
debugDiv.style.fontSize = '8px';
debugDiv.style.padding = '2px';
debugDiv.style.zIndex = '9999';
debugDiv.innerText = 'JS RUNNING';
document.body.appendChild(debugDiv);
