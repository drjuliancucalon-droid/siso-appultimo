import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[SISO ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        React.createElement('div', {
          style: {
            padding: '2rem', fontFamily: 'sans-serif',
            color: '#dc2626', background: '#fff', minHeight: '100vh'
          }
        },
          React.createElement('h2', null, 'Error en la aplicacion'),
          React.createElement('pre', {
            style: {
              fontSize: '12px', background: '#fee2e2',
              padding: '1rem', borderRadius: '8px',
              whiteSpace: 'pre-wrap', wordBreak: 'break-all'
            }
          }, String(this.state.error)),
          React.createElement('button', {
            onClick: () => window.location.reload(),
            style: {
              marginTop: '1rem', padding: '8px 16px',
              background: '#dc2626', color: '#fff',
              border: 'none', borderRadius: '6px', cursor: 'pointer'
            }
          }, 'Recargar')
        )
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
