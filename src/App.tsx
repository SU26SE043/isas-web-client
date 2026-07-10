import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';
import { AppRouter } from './routes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
