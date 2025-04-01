import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Corelation from '../Corelation';

describe('City Comparison App', () => {
  test('renders component with title', () => {
    render(<Corelation />);
    expect(screen.getByText('City Comparison App')).toBeInTheDocument();
  });

  test('renders edit weights button', () => {
    render(<Corelation />);
    expect(screen.getByText('Edit Weights')).toBeInTheDocument();
  });

  // test('renders city input fields', () => {
  //   render(<Corelation />);
  //   expect(screen.getByPlaceholderText('Enter city name')).toBeInTheDocument();
  //   expect(screen.getAllByPlaceholderText('Enter city name')).toHaveLength(2);
  // });

  test('renders preference selectors', () => {
    render(<Corelation />);
    expect(screen.getByLabelText('Temperature Preference:')).toBeInTheDocument();
    expect(screen.getByLabelText('Humidity Preference:')).toBeInTheDocument();
    expect(screen.getByLabelText('Wind Speed Preference:')).toBeInTheDocument();
    expect(screen.getByLabelText('Precipitation Preference:')).toBeInTheDocument();
    expect(screen.getByLabelText('Air Quality Preference:')).toBeInTheDocument();
  });

  test('updates temperature preference', () => {
    render(<Corelation />);
    const tempSelect = screen.getByLabelText('Temperature Preference:');
    fireEvent.change(tempSelect, { target: { value: 'high' } });
    expect(tempSelect.value).toBe('high');
  });

  test('updates humidity preference', () => {
    render(<Corelation />);
    const humiditySelect = screen.getByLabelText('Humidity Preference:');
    fireEvent.change(humiditySelect, { target: { value: 'low' } });
    expect(humiditySelect.value).toBe('low');
  });

  test('updates wind speed preference', () => {
    render(<Corelation />);
    const windSelect = screen.getByLabelText('Wind Speed Preference:');
    fireEvent.change(windSelect, { target: { value: 'high' } });
    expect(windSelect.value).toBe('high');
  });

  test('updates precipitation preference', () => {
    render(<Corelation />);
    const precipSelect = screen.getByLabelText('Precipitation Preference:');
    fireEvent.change(precipSelect, { target: { value: 'low' } });
    expect(precipSelect.value).toBe('low');
  });

  test('updates air quality preference', () => {
    render(<Corelation />);
    const aqiSelect = screen.getByLabelText('Air Quality Preference:');
    fireEvent.change(aqiSelect, { target: { value: 'high' } });
    expect(aqiSelect.value).toBe('high');
  });

  test('renders compare button', () => {
    render(<Corelation />);
    expect(screen.getByText('Compare Cities')).toBeInTheDocument();
  });

  test('renders weather display section', () => {
    render(<Corelation />);
    expect(screen.getByTestId('weather-display')).toBeInTheDocument();
  });
});
