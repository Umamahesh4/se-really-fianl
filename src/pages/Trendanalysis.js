// src/App.js
import React from 'react';
import './home.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Trends from '../components/Trend';

function App() {
  return (
    <div className="page-wrapper">
      <Header />
      <Sidebar />
      <div className="main-content">
        <Trends />
      </div>
      <Footer />
    </div>
  );
}

export default App;