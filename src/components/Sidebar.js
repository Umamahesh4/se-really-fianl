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
    <i className="fas fa-bars"></i> Menu
  </div>
  <ul>
    <li>
      <button onClick={() => handleNavigation('/ranking')} className="sidebar-link">🏆 Ranking</button>
    </li>
    <li>
      <button onClick={() => handleNavigation('/trend')} className="sidebar-link">📈 Trend Analysis</button>
    </li>
    <li>
      <button onClick={() => handleNavigation('/mapping')} className="sidebar-link">📍 Monitor Multiple Locations</button>
    </li>
    <li>
      <button onClick={() => handleNavigation('/corelation')} className="sidebar-link">🚨 Corelation</button>
    </li>
    <li>
      <button onClick={() => handleNavigation('/image')} className="sidebar-link">🚨 Image Classifier</button>
    </li>
    <li>
      <button onClick={() => handleNavigation('/forecast')} className="sidebar-link">🚨 Weather Forecast</button>
    </li>
    <li>
      <button className="sidebar-link">🚨 Alert Management</button>
    </li>
    <li>
      <button onClick={() => handleNavigation('/notifications')} className="sidebar-link">🔔 Notifications</button>
    </li>
    <li>
      <button onClick={() => handleNavigation('/feedback')} className="sidebar-link">💬 Feedback</button>
    </li>
  </ul>
</div>

  );
}

export default Sidebar;