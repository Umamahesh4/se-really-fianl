import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import WeatherMap from '../WeatherMap';
import axios from 'axios';
import { act } from 'react-dom/test-utils';

jest.mock('axios');

describe('WeatherMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the map container', () => {
    render(<WeatherMap />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  test('shows loading indicator when fetching data', async () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    
    render(<WeatherMap />);
    act(() => {
      const map = screen.getByTestId('map-container');
      map.click();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
  });

  test('displays weather data after successful fetch', async () => {
    const mockLocation = {
      data: {
        address: {
          city: "Test City",
          state: "Test State"
        }
      }
    };

    const mockWeather = {
      data: {
        main: {
          temp: 25,
          feels_like: 27,
          humidity: 65,
          pressure: 1013
        },
        weather: [{ description: "clear sky" }],
        wind: { speed: 5 }
      }
    };

    axios.get.mockResolvedValueOnce(mockLocation)
           .mockResolvedValueOnce(mockWeather);

    render(<WeatherMap />);
    
    act(() => {
      const map = screen.getByTestId('map-container');
      map.click();
    });

    await waitFor(() => {
      expect(screen.getByText(/Test City, Test State/i)).toBeInTheDocument();
      expect(screen.getByText(/Temperature: 25°C/i)).toBeInTheDocument();
      expect(screen.getByText(/clear sky/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));

    render(<WeatherMap />);
    
    act(() => {
      const map = screen.getByTestId('map-container');
      map.click();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });
});