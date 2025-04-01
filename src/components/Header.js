import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header>
      <h1 onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        Weather Dashboard
      </h1>
      <nav>
        <ul>
          <li>
            <Link to="/" data-testid="link-/">Home</Link>
          </li>
          <li>
            <Link to="/weather-map" data-testid="link-/weather-map">Weather Map</Link>
          </li>
          <li>
            <Link to="/rankings" data-testid="link-/rankings">Rankings</Link>
          </li>
          <li>
            <Link to="/trend" data-testid="link-/trend">Trend Analysis</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;