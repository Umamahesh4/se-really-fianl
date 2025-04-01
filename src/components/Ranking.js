// Ranking.js
import React, { useState, useEffect } from 'react';

const Ranking = () => {
  const [cities] = useState([
    { name: 'New York', score: 85 },
    { name: 'London', score: 80 },
    { name: 'Tokyo', score: 75 },
  ]);
  const [weights, setWeights] = useState({
    temperature: 0.3,
    humidity: 0.2,
    wind: 0.2,
    precipitation: 0.3,
  });
  const [editingWeights, setEditingWeights] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (city) => {
    try {
      const response = await fetch(`https://api.example.com/weather?city=${city}`);
      const data = await response.json();
      setWeatherData(data);
      setSelectedCity(city);
      setError(null);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data');
      setWeatherData(null);
    }
  };

  const handleWeightChange = (e) => {
    const { name, value } = e.target;
    setWeights(prev => ({
      ...prev,
      [name]: Math.min(1, Math.max(0, parseFloat(value)) || 0)
    }));
  };

  const handleSaveWeights = () => {
    setEditingWeights(false);
  };

  const getWeatherDetail = (data, field) => {
    return data?.daily?.[field]?.[0] ?? 'N/A';
  };

  return (
    <div className="ranking-container">
      <h1>🏆 City Rankings</h1>
      
      {editingWeights ? (
        <div className="weight-editor">
          <h3>Edit Weights</h3>
          {Object.entries(weights).map(([key, value]) => (
            <div key={key}>
              <label>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
                <input
                  type="number"
                  name={key}
                  min="0"
                  max="1"
                  step="0.1"
                  value={value}
                  onChange={handleWeightChange}
                />
              </label>
            </div>
          ))}
          <button onClick={handleSaveWeights}>Save Weights</button>
        </div>
      ) : (
        <button onClick={() => setEditingWeights(true)}>Edit Weights</button>
      )}

      <table className="ranking-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>City</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {cities.sort((a, b) => b.score - a.score).map((city, index) => (
            <tr 
              key={city.name} 
              onClick={() => fetchWeatherData(city.name)}
              data-testid="city-row"
            >
              <td>{index + 1}</td>
              <td>{city.name}</td>
              <td>{city.score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCity && (
        <div className="weather-details">
          <h3>Weather Details for {selectedCity}</h3>
          {weatherData?.daily ? (
            <>
              <p>Temperature: {getWeatherDetail(weatherData, 'temperature_2m_max')}°C</p>
              <p>Humidity: {getWeatherDetail(weatherData, 'relative_humidity_2m_max')}%</p>
              <p>Wind Speed: {getWeatherDetail(weatherData, 'wind_speed_10m_max')} km/h</p>
              <p>Precipitation: {getWeatherDetail(weatherData, 'precipitation_sum')} mm</p>
            </>
          ) : (
            <p>No weather data available</p>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Ranking;