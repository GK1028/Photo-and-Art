import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// --- Splash Screen Logic ---
// Wait for a bit to ensure the splash screen is visible, then fade it out.
// This creates a smooth loading experience.
const splash = document.getElementById('splash');
if (splash) {
  setTimeout(() => {
    splash.classList.add('splash-hidden');
    // Optional: remove the element from the DOM after the transition is complete
    splash.addEventListener('transitionend', () => {
      splash.remove();
    });
  }, 5000); // Display splash for 5 seconds
}