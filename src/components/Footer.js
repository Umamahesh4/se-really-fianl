import React from 'react';

function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="footer-col">
        <h4>About Us</h4>
        <ul>
          <li>Our Story</li>
          <li>Careers</li>
          <li>Privacy Policy</li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Contact Us</h4>
        <ul>
          <li><a>Support</a></li>
          <li><a>Sales</a></li>
          <li><a>Feedback</a></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Follow Us</h4>
        <div className="social-links">
          <a><i className="fab fa-facebook-f"></i></a>
          <a><i className="fab fa-twitter"></i></a>
          <a><i className="fab fa-instagram"></i></a>
          <a><i className="fab fa-linkedin-in"></i></a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;