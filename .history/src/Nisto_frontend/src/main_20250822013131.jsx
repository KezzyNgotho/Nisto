// Polyfill for DFINITY/Node.js libraries in browser
if (typeof global === 'undefined') {
  window.global = window;
}

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// import '..'; // Removed problematic import
import 
import AOS from 'aos';
import 'aos/dist/aos.css';

const container = document.getElementById('root');
const root = createRoot(container);

function Main() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);
  return <App />;
}

root.render(<Main />); 
