import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 1. Adicione esta linha:
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* 2. Envolva o App com este componente e coloque seu ID */}
    <GoogleOAuthProvider clientId="COLE_SEU_CLIENT_ID_AQUI_SE_TIVER">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
