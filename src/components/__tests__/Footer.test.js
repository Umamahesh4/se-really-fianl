import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component', () => {
  test('renders footer with correct ID', () => {
    render(<Footer />);
    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toHaveAttribute('id', 'footer');
  });

  test('renders About Us section', () => {
    render(<Footer />);
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Our Story')).toBeInTheDocument();
    expect(screen.getByText('Careers')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  test('renders Contact Us section', () => {
    render(<Footer />);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });

  test('renders Follow Us section with social links', () => {
    render(<Footer />);
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
    
    // Check for social media icons by their class names
    const socialLinks = document.querySelectorAll('.social-links a');
    expect(socialLinks).toHaveLength(4);
    
    // Check for specific social media icons
    expect(document.querySelector('.fa-facebook-f')).toBeInTheDocument();
    expect(document.querySelector('.fa-twitter')).toBeInTheDocument();
    expect(document.querySelector('.fa-instagram')).toBeInTheDocument();
    expect(document.querySelector('.fa-linkedin-in')).toBeInTheDocument();
  });
}); 