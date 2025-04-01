import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import Gps from '../Gps';

// Mock GaugeComponent
jest.mock('../GaugeComponent', () => {
  return function MockGauge({ id, value, unit, min, max }) {
    return (
      <div data-testid={`gauge-${id}`}>
        Mock Gauge: {value} {unit} (min: {min}, max: {max})
      </div>
    );
  };
});

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
});

// Mock fetch
global.fetch = jest.fn();

describe('Gps Component', () => {
  const mockPosition = {
    coords: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
  };

  const mockWeatherData = {
    temperature: 25,
    humidity: 60,
    wind_speed: 10,
  };

  const mockCityData = {
    address: {
      city: 'New York',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock geolocation success
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    // Mock fetch responses
    global.fetch.mockImplementation((url) => {
      if (url.includes('nominatim.openstreetmap.org')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCityData),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockWeatherData),
      });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders component with title', () => {
    render(<Gps />);
    expect(screen.getByText('Weather Dashboard')).toBeInTheDocument();
  });

  test('displays loading message initially', () => {
    render(<Gps />);
    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
  });

  test('displays weather data after successful fetch', async () => {
    render(<Gps />);

    // Advance timers to trigger geolocation
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Flush promises
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('📍 New York')).toBeInTheDocument();
      expect(screen.getByText(/Coordinates: 40.7128, -74.006/)).toBeInTheDocument();
      expect(screen.getByText('25 °C')).toBeInTheDocument();
      expect(screen.getByText('60 %')).toBeInTheDocument();
      expect(screen.getByText('10 m/s')).toBeInTheDocument();
    });
  });

  test('renders gauge components with correct props', async () => {
    render(<Gps />);

    // Advance timers to trigger geolocation
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Flush promises
    });

    // Wait for gauges to render
    await waitFor(() => {
      expect(screen.getByTestId('gauge-tempGauge')).toBeInTheDocument();
      expect(screen.getByTestId('gauge-humidityGauge')).toBeInTheDocument();
      expect(screen.getByTestId('gauge-windGauge')).toBeInTheDocument();
    });
  });

  test('handles geolocation error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(new Error('Geolocation error'));
    });

    render(<Gps />);

    // Advance timers to trigger geolocation
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Flush promises
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting location:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  test('handles weather API error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockRejectedValueOnce(new Error('Weather API error'));

    render(<Gps />);

    // Advance timers to trigger geolocation
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Flush promises
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching weather data:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  test('handles city name fetch error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockImplementation((url) => {
      if (url.includes('nominatim.openstreetmap.org')) {
        return Promise.reject(new Error('Geocoding error'));
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockWeatherData),
      });
    });

    render(<Gps />);

    // Advance timers to trigger geolocation
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Flush promises
    });

    await waitFor(() => {
      expect(screen.getByText('📍 Unknown Location')).toBeInTheDocument();
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching city name:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  test('updates timestamp when weather data is fetched', async () => {
    render(<Gps />);

    // Advance timers to trigger geolocation
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Flush promises
    });

    await waitFor(() => {
      const timestamp = screen.getByText(/Last Updated:/);
      expect(timestamp).toBeInTheDocument();
    });
  });

  test('handles missing city data gracefully', async () => {
    const mockCityDataWithoutCity = {
      address: {
        town: 'New York',
      },
    };

    global.fetch.mockImplementation((url) => {
      if (url.includes('nominatim.openstreetmap.org')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCityDataWithoutCity),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockWeatherData),
      });
    });

    render(<Gps />);

    // Advance timers to trigger geolocation
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve(); // Flush promises
    });

    await waitFor(() => {
      expect(screen.getByText('📍 New York')).toBeInTheDocument();
    });
  });
}); 