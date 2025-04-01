import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', { name: /welcome/i });
  expect(headingElement).toBeInTheDocument();
});