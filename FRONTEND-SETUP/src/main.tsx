import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';



const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
   <BrowserRouter>
     <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
    <App />
      </QueryClientProvider >
     </GoogleOAuthProvider>
    <Toaster
    position='top-right'
    />
   </BrowserRouter>
)
