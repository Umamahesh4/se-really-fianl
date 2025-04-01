import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Corelation from './pages/Corelationpage';

const App = () => {
  return (
    <Router>
      <header>
        <h1>Welcome to the Weather Dashboard</h1>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/corelation" element={<Corelation />} />
      </Routes>
    </Router>
  );
};

export default App;