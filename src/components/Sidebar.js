// src/components/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
function Sidebar() {
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle navigation
  const handleNavigation = (path) => {
    navigate(path); // Navigate to the specified path
  };
  return (
    <div className="sidebar">
      <div className="text">
        <i className="fas fa-bars"></i>Menu
      </div>
      <ul>
        <li onClick={() => handleNavigation('/ranking')}><a>🏆 Ranking</a></li>
        <li onClick={() => handleNavigation('/trend')}><a >📈 Trend Analysis</a></li>
        
        <li onClick={() => handleNavigation('/mapping')}><a>📍 Monitor Multiple Locations</a></li>
        <li onClick={() => handleNavigation('/corelation')}><a>🚨 Corelation</a></li>
        <li onClick={() => handleNavigation('/image')}><a >🚨 Image Classifier</a></li>
        <li onClick={() => handleNavigation('/forecast')}><a >🚨 Weather Forecast</a></li>
        <li><a href="#">🚨 Alert Management</a></li>
        <li><a href="#">🔔 Notifications</a></li>
        <li><a href="#">💬 Feedback</a></li>
      </ul>
    </div>
  );
}

export default Sidebar;