// Ranking.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Ranking from '../Ranking';

global.fetch = jest.fn();

describe('Ranking Component', () => {
  const mockCities = [
    { name: 'New York', score: 85 },
    { name: 'London', score: 80 },
    { name: 'Tokyo', score: 75 },
  ];

  const mockWeatherData = {
    daily: {
      time: ['2024-03-01'],
      temperature_2m_max: [25],
      temperature_2m_min: [15],
      precipitation_sum: [0],
      wind_speed_10m_max: [10],
      relative_humidity_2m_max: [60],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockImplementation(() => Promise.resolve({
      json: () => Promise.resolve(mockWeatherData),
    }));
  });

  test('renders component with title', () => {
    render(<Ranking />);
    expect(screen.getByText('🏆 City Rankings')).toBeInTheDocument();
  });

  test('displays default rankings', () => {
    render(<Ranking />);
    mockCities.forEach(city => {
      expect(screen.getByText(city.name)).toBeInTheDocument();
      expect(screen.getByText(city.score.toString())).toBeInTheDocument();
    });
  });

  test('allows editing city weights', async () => {
    render(<Ranking />);
    
    fireEvent.click(screen.getByText('Edit Weights'));
    expect(screen.getByText('Save Weights')).toBeInTheDocument();

    const temperatureInput = screen.getByLabelText(/Temperature/i);
    fireEvent.change(temperatureInput, { target: { value: '0.5' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Save Weights'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Edit Weights')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error('API Error'));
    
    render(<Ranking />);
    
    await act(async () => {
      fireEvent.click(screen.getAllByTestId('city-row')[0]);
    });
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching weather data:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('displays weather details for selected city', async () => {
    render(<Ranking />);
    
    await act(async () => {
      fireEvent.click(screen.getAllByTestId('city-row')[0]);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Temperature: 25°C/)).toBeInTheDocument();
      expect(screen.getByText(/Humidity: 60%/)).toBeInTheDocument();
    });
  });

  test('handles missing weather data gracefully', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve({}),
    }));
    
    render(<Ranking />);
    
    await act(async () => {
      fireEvent.click(screen.getAllByTestId('city-row')[0]);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/No weather data available/)).toBeInTheDocument();
    });
  });
});