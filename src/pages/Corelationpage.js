// src/App.js
import React from 'react';
import './home.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Co from '../components/Corelation';

function App() {
  return (
    <div className="page-wrapper">
      <Header />
      <Sidebar />
      <div className="main-content">
        <div className="correlation-page-container">
          <div className="correlation-content">
            <Co />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;