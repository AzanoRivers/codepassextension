import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppUi } from './AppUi.jsx'
import { LoginProvider } from '@contexts/LoginContext.jsx'
import { CodePassProvider } from '@contexts/CodepassContext';

ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>
    <LoginProvider>
      <CodePassProvider>
        <AppUi />
      </CodePassProvider>
    </LoginProvider>
  </React.StrictMode>,
)