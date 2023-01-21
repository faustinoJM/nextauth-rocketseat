import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../contexts/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  return ( 
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}


/*
.container {
  width: 100vh;
  height: 100vh;
  margin: 0 auto;
  border: 3px solid red;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.container input {
  margin: 0.25rem;
  padding: 0.25rem;
}*/