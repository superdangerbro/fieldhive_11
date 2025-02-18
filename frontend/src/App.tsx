import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import Layout from './components/Layout';
import MapView from './components/MapView';
import SectionManager from './components/SectionManager';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<MapView />} />
                <Route path="/forms" element={<SectionManager />} />
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App; 