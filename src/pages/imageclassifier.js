// src/App.js
import React from 'react';
import './home.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Image from '../components/ImageClassify';

function App() {
  return (
    <div className="page-wrapper">
      <Header />
      <Sidebar />
      <div className="main-content">
        <Image />
      </div>
      <Footer />
    </div>
  );
}

export default App;