import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

// Mock react-router-dom
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => (
    <a
      href={to}
      data-testid={`link-${to}`}
      onClick={(e) => {
        e.preventDefault();
        mockNavigate(to);
      }}
    >
      {children}
    </a>
  ),
}));

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders header with title', () => {
    render(<Header />);
    expect(screen.getByText('Weather Dashboard')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByTestId('link-/')).toBeInTheDocument();
    expect(screen.getByTestId('link-/weather-map')).toBeInTheDocument();
    expect(screen.getByTestId('link-/rankings')).toBeInTheDocument();
    expect(screen.getByTestId('link-/trend')).toBeInTheDocument();
  });

  test('navigates to home when logo is clicked', () => {
    render(<Header />);
    const logo = screen.getByText('Weather Dashboard');
    fireEvent.click(logo);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('navigates to weather map when link is clicked', () => {
    render(<Header />);
    const mapLink = screen.getByTestId('link-/weather-map');
    fireEvent.click(mapLink);
    expect(mockNavigate).toHaveBeenCalledWith('/weather-map');
  });

  test('navigates to rankings when link is clicked', () => {
    render(<Header />);
    const rankingsLink = screen.getByTestId('link-/rankings');
    fireEvent.click(rankingsLink);
    expect(mockNavigate).toHaveBeenCalledWith('/rankings');
  });

  test('navigates to trend analysis when link is clicked', () => {
    render(<Header />);
    const trendLink = screen.getByTestId('link-/trend');
    fireEvent.click(trendLink);
    expect(mockNavigate).toHaveBeenCalledWith('/trend');
  });
});