// src/App.js
import React from 'react';
import './home.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Gps from '../components/Gps';
function App() {
  return (
    <div className="page-wrapper">
      <Header />
      <Sidebar />
      <div className="main-content">
        <Gps />
            {/* Middle part is left empty as requested */}
          
        
      </div>
      <Footer />
    </div>
  );
}

export default App;