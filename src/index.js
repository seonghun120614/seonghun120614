import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Main from './component/Main';
import Menu from './component/Menu';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Main />
    <Menu />
    
  </React.StrictMode>
);
