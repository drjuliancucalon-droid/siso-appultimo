import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Sin StrictMode para evitar doble render que causa timing issues con Context
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);