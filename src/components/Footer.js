import React from "react";

function Footer() {
  return (
    <footer id="footer" className="footer">
      {/* About Us Section */}
      <div className="footer-col">
        <h4>About Us</h4>
        <ul>
          <li>
            <a href="/our-story">Our Story</a>
          </li>
          <li>
            <a href="/careers">Careers</a>
          </li>
          <li>
            <a href="/privacy-policy">Privacy Policy</a>
          </li>
        </ul>
      </div>

      {/* Contact Us Section */}
      <div className="footer-col">
        <h4>Contact Us</h4>
        <ul>
          <li>
            <a href="/support">Support</a>
          </li>
          <li>
            <a href="/sales">Sales</a>
          </li>
          <li>
            <a href="/feedback">Feedback</a>
          </li>
        </ul>
      </div>

      {/* Social Media Links */}
      <div className="footer-col">
        <h4>Follow Us</h4>
        <div className="social-links">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <i className="fab fa-twitter"></i>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <i className="fab fa-linkedin-in"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
