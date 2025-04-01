import React, { useState } from 'react';
import axios from 'axios';

const WeatherMap = () => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  const handleMapClick = async () => {
    setLoading(true);
    setError('');
    setLocation(null);
    setWeather(null);

    try {
      // Mock location data
      const locationResponse = await axios.get('/api/location');
      setLocation(locationResponse.data);

      // Mock weather data
      const weatherResponse = await axios.get('/api/weather');
      setWeather(weatherResponse.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        data-testid="map-container"
        style={{ width: '100%', height: '400px', backgroundColor: '#ddd', cursor: 'pointer' }}
        onClick={handleMapClick}
      >
        Click on the map to fetch weather data
      </div>

      {loading && <p data-testid="loading-indicator">Loading...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {location && weather && (
        <div>
          <h2>{`${location.address.city}, ${location.address.state}`}</h2>
          <p>{`Temperature: ${weather.main.temp}°C`}</p>
          <p>{`Feels Like: ${weather.main.feels_like}°C`}</p>
          <p>{`Humidity: ${weather.main.humidity}%`}</p>
          <p>{`Pressure: ${weather.main.pressure} hPa`}</p>
          <p>{`Wind Speed: ${weather.wind.speed} m/s`}</p>
          <p>{weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherMap;