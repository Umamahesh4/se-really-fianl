import React from 'react';

function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="footer-col">
        <h4>About Us</h4>
        <ul>
          <li><button className="link-button">Our Story</button></li>
          <li><button className="link-button">Careers</button></li>
          <li><button className="link-button">Privacy Policy</button></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Contact Us</h4>
        <ul>
          <li><button className="link-button">Support</button></li>
          <li><button className="link-button">Sales</button></li>
          <li><button className="link-button">Feedback</button></li>
        </ul>
      </div>
      <div className="footer-col">
        <h4>Follow Us</h4>
        <div className="social-links">
          <button className="link-button"><i className="fab fa-facebook-f"></i></button>
          <button className="link-button"><i className="fab fa-twitter"></i></button>
          <button className="link-button"><i className="fab fa-instagram"></i></button>
          <button className="link-button"><i className="fab fa-linkedin-in"></i></button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
