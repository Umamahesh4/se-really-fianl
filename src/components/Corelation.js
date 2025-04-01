import React, { useState } from 'react';

const Corelation = () => {
  const [cities, setCities] = useState(['', '']);
  const [preferences, setPreferences] = useState({
    temperature: '',
    humidity: '',
    windSpeed: '',
    precipitation: '',
    airQuality: '',
  });

  const handleCityChange = (index, value) => {
    const updatedCities = [...cities];
    updatedCities[index] = value;
    setCities(updatedCities);
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <h1>City Comparison App</h1>
      <button>Edit Weights</button>

      <div>
        {cities.map((city, index) => (
          <input
            key={index}
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => handleCityChange(index, e.target.value)}
          />
        ))}
      </div>

      <div>
        <label>
          Temperature Preference:
          <select
            value={preferences.temperature}
            onChange={(e) => handlePreferenceChange('temperature', e.target.value)}
          >
            <option value="">Select</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label>
          Humidity Preference:
          <select
            value={preferences.humidity}
            onChange={(e) => handlePreferenceChange('humidity', e.target.value)}
          >
            <option value="">Select</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label>
          Wind Speed Preference:
          <select
            value={preferences.windSpeed}
            onChange={(e) => handlePreferenceChange('windSpeed', e.target.value)}
          >
            <option value="">Select</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label>
          Precipitation Preference:
          <select
            value={preferences.precipitation}
            onChange={(e) => handlePreferenceChange('precipitation', e.target.value)}
          >
            <option value="">Select</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label>
          Air Quality Preference:
          <select
            value={preferences.airQuality}
            onChange={(e) => handlePreferenceChange('airQuality', e.target.value)}
          >
            <option value="">Select</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>

      <button>Compare Cities</button>

      <div data-testid="weather-display">
        {/* Weather display section */}
      </div>
    </div>
  );
};

export default Corelation;