import React from 'react';
import { useNavigate } from 'react-router-dom';  // If you're using React Router for navigation

function Footer() {
  const navigate = useNavigate(); // Using React Router's useNavigate hook for navigation

  const handleNavigation = (path) => {
    navigate(path); // Navigating to the provided path
  };

  return (
    <footer id="footer" className="footer">
      <div className="footer-col">
        <h4>About Us</h4>
        <ul>
          <li><button onClick={() => handleNavigation('/')}>Our Story</button></li>
          <li><button onClick={() => handleNavigation('/')}>Careers</button></li>
          <li><button onClick={() => handleNavigation('/')}>Privacy Policy</button></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Contact Us</h4>
        <ul>
          <li><button onClick={() => handleNavigation('/')}>Support</button></li>
          <li><button onClick={() => handleNavigation('/')}>Sales</button></li>
          <li><button onClick={() => handleNavigation('/')}>Feedback</button></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Follow Us</h4>
        <div className="social-links">
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <i className="fab fa-linkedin-in"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
