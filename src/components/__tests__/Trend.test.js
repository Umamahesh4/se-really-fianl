import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import WeatherDashboard from '../Trend';

// Mock fetch
global.fetch = jest.fn();

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Radar: () => <div data-testid="radar-chart">Radar Chart</div>,
  PolarArea: () => <div data-testid="polar-area-chart">Polar Area Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}));

// Mock window.alert
//dfasd
const mockAlert = jest.fn();
window.alert = mockAlert;

describe('WeatherDashboard Component', () => {
  const mockGeocodeResponse = {
    results: [{
      geometry: {
        lat: 40.7128,
        lng: -74.0060,
      },
    }],
  };

  const mockWeatherResponse = {
    daily: {
      time: ['2024-03-01', '2024-03-02', '2024-03-03'],
      temperature_2m_max: [25, 26, 27],
      temperature_2m_min: [15, 16, 17],
      precipitation_sum: [0, 5, 10],
      wind_speed_10m_max: [10, 15, 20],
      relative_humidity_2m_max: [60, 65, 70],
      surface_pressure_max: [1015, 1016, 1017],
      uv_index_max: [5, 6, 7],
      sunrise: ['06:00', '06:01', '06:02'],
      sunset: ['18:00', '18:01', '18:02'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock a delayed response to ensure loading state is visible
    global.fetch.mockImplementation((url) => {
      if (url.includes('opencagedata.com')) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              json: () => Promise.resolve(mockGeocodeResponse),
            });
          }, 100);
        });
      }
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            json: () => Promise.resolve(mockWeatherResponse),
          });
        }, 100);
      });
    });
  });

  test('renders component with title', () => {
    render(<WeatherDashboard />);
    expect(screen.getByText('📊 Weather Trend Analysis')).toBeInTheDocument();
  });

  test('renders search input and button', () => {
    render(<WeatherDashboard />);
    expect(screen.getByPlaceholderText('Enter city name...')).toBeInTheDocument();
    expect(screen.getByText('Get Weather')).toBeInTheDocument();
  });

  test('shows loading state while fetching data', async () => {
    render(<WeatherDashboard />);
    
    const input = screen.getByPlaceholderText('Enter city name...');
    const button = screen.getByText('Get Weather');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'New York' } });
      fireEvent.click(button);
    });
    
    // Check for loading state
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('🌍 New York')).toBeInTheDocument();
    });
  });

  test('displays weather data after successful fetch', async () => {
    render(<WeatherDashboard />);
    
    const input = screen.getByPlaceholderText('Enter city name...');
    const button = screen.getByText('Get Weather');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'New York' } });
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(screen.getByText('🌍 New York')).toBeInTheDocument();
      expect(screen.getByText(/Weather Summary/)).toBeInTheDocument();
      expect(screen.getByText(/27.0°C/)).toBeInTheDocument();
      expect(screen.getByText(/15.0°C/)).toBeInTheDocument();
    });
  });

  test('handles city not found error', async () => {
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve({ results: [] }),
    }));
    
    render(<WeatherDashboard />);
    
    const input = screen.getByPlaceholderText('Enter city name...');
    const button = screen.getByText('Get Weather');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Invalid City' } });
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('City not found. Try another city.');
    });
  });

  test('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockRejectedValueOnce(new Error('API Error'));
    
    render(<WeatherDashboard />);
    
    const input = screen.getByPlaceholderText('Enter city name...');
    const button = screen.getByText('Get Weather');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'New York' } });
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to fetch weather data.');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching data:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('generates weather insights based on data', async () => {
    const highWindData = {
      ...mockWeatherResponse,
      daily: {
        ...mockWeatherResponse.daily,
        wind_speed_10m_max: [60, 65, 70],
      },
    };
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('opencagedata.com')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockGeocodeResponse),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(highWindData),
      });
    });
    
    render(<WeatherDashboard />);
    
    const input = screen.getByPlaceholderText('Enter city name...');
    const button = screen.getByText('Get Weather');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'New York' } });
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/⚠️ Strong winds detected/)).toBeInTheDocument();
    });
  });

  test('switches between different chart types', async () => {
    render(<WeatherDashboard />);
    
    // First fetch some data
    const input = screen.getByPlaceholderText('Enter city name...');
    const button = screen.getByText('Get Weather');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'New York' } });
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    
    // Test chart type switching
    const chartTypeSelect = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(chartTypeSelect, { target: { value: 'bar' } });
    });
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.change(chartTypeSelect, { target: { value: 'radar' } });
    });
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  test('toggles  selection', async () => {
    render(<WeatherDashboard />);
    
    // First fetch some data
    const input = screen.getByPlaceholderText('Enter city name...');
    const button = screen.getByText('Get Weather');
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'New York' } });
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Weather Summary/)).toBeInTheDocument();
    });
    
    // Test metric toggling
    const temperatureCheckbox = screen.getByLabelText(/Max Temperature/i);
    await act(async () => {
      fireEvent.click(temperatureCheckbox);
    });
    
    expect(temperatureCheckbox).toBeChecked();
  });
}); 