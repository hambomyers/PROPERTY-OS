import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import PropertyView from './components/PropertyView';
import PropertyInputForm from './components/PropertyInputForm';
import Home from './components/Home';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/add-property" element={<Layout><PropertyInputForm /></Layout>} />
            <Route path="/property/:id" element={<Layout><PropertyView /></Layout>} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
