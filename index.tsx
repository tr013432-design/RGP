import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; 
// 1. Importação da ferramenta do Google
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    {/* 2. O App DEVE estar dentro deste Provider para o Dante funcionar */}
    {/* Se você não tiver um ID real agora, pode deixar esse texto de exemplo, 
        o Dante vai abrir, mas o botão de salvar vai dar erro ao clicar. */}
    <GoogleOAuthProvider clientId="464694337692-b59b61n80icfqnm3usc3jc19l2v7gra7.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
