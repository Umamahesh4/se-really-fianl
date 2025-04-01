import React, { useState } from "react";
// Use require for axios instead of ES import
const axios = require("axios");
// For CSS, you may leave the import as is (if your build supports it) or require it
import "./Corelation.css";

const Corelation = () => {
  const [city1, setCity1] = useState("");
  const [city2, setCity2] = useState("");
  const [city1Data, setCity1Data] = useState(null);
  const [city2Data, setCity2Data] = useState(null);
  const [betterCity, setBetterCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editWeights, setEditWeights] = useState(false);
  const [tempWeights, setTempWeights] = useState({});
  const [correlations, setCorrelations] = useState({});

  // User preferences state
  const [preferences, setPreferences] = useState({
    temperature: "low",
    humidity: "low",
    windSpeed: "low",
    precipitation: "low",
    airQuality: "low",
  });

  // Weights for each preference
  const [weights, setWeights] = useState({
    temperature: 0.4,
    humidity: 0.2,
    windSpeed: 0.15,
    precipitation: 0.15,
    airQuality: 0.1,
  });

  // Fetch current weather data from OpenWeatherMap API
  const fetchCurrentWeather = async (city) => {
    const API_KEY = "7eeba6a8fe29e05163a9d8011bffcba3"; // Your API key
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      return response.data;
    } catch (err) {
      setError("Failed to fetch current weather data. Please check the city name.");
      return null;
    }
  };

  // Fetch 5-day forecast data for precipitation
  const fetchPrecipitation = async (city) => {
    const API_KEY = "7eeba6a8fe29e05163a9d8011bffcba3"; // Your API key
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      const precipitationData = response.data.list.map((item) => item.rain?.["3h"] || 0);
      const averagePrecipitation =
        precipitationData.reduce((sum, val) => sum + val, 0) / precipitationData.length;
      return averagePrecipitation;
    } catch (err) {
      setError("Failed to fetch precipitation data.");
      return 0;
    }
  };

  // Fetch AQI data from Air Pollution API
  const fetchAQI = async (lat, lon) => {
    const API_KEY = "7eeba6a8fe29e05163a9d8011bffcba3"; // Your API key
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      return response.data.list[0].main.aqi;
    } catch (err) {
      setError("Failed to fetch AQI data.");
      return null;
    }
  };

  // Fetch correlation data from Flask backend
  const fetchCorrelation = async (city1, city2, attribute) => {
    try {
      const response = await axios.post("http://localhost:5001/correlation", {
        city1,
        city2,
        attribute,
      });
      return response.data.correlation;
    } catch (error) {
      console.error("Error fetching correlation data:", error);
      return null;
    }
  };

  // Handle form submission
  const handleCompare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data1 = await fetchCurrentWeather(city1);
    const data2 = await fetchCurrentWeather(city2);

    if (data1 && data2) {
      // Fetch additional data (precipitation and AQI)
      const precip1 = await fetchPrecipitation(city1);
      const precip2 = await fetchPrecipitation(city2);
      const aqi1 = await fetchAQI(data1.coord.lat, data1.coord.lon);
      const aqi2 = await fetchAQI(data2.coord.lat, data2.coord.lon);

      // Add precipitation and AQI to city data
      data1.precipitation = precip1;
      data2.precipitation = precip2;
      data1.aqi = aqi1;
      data2.aqi = aqi2;

      setCity1Data(data1);
      setCity2Data(data2);

      // Fetch correlation values for all attributes (excluding AQI)
      const tempCorrelation = await fetchCorrelation(city1, city2, "temperature");
      const humidityCorrelation = await fetchCorrelation(city1, city2, "humidity");
      const windSpeedCorrelation = await fetchCorrelation(city1, city2, "windspeed");
      const precipitationCorrelation = await fetchCorrelation(city1, city2, "precipitation");

      const newCorrelations = {};
      if (tempCorrelation !== null) newCorrelations.temperature = tempCorrelation;
      if (humidityCorrelation !== null) newCorrelations.humidity = humidityCorrelation;
      if (windSpeedCorrelation !== null) newCorrelations.windSpeed = windSpeedCorrelation;
      if (precipitationCorrelation !== null) newCorrelations.precipitation = precipitationCorrelation;

      setCorrelations(newCorrelations);

      const better = compareCities(data1, data2, preferences, weights);
      setBetterCity(better);
    }

    setLoading(false);
  };

  // Compare cities based on user preferences and weights
  const compareCities = (city1, city2, preferences, weights) => {
    let city1Score = 0;
    let city2Score = 0;

    // Temperature
    if (preferences.temperature === "low") {
      if (city1.main.temp < city2.main.temp) city1Score += weights.temperature;
      else city2Score += weights.temperature;
    } else {
      if (city1.main.temp > city2.main.temp) city1Score += weights.temperature;
      else city2Score += weights.temperature;
    }

    // Humidity
    if (preferences.humidity === "low") {
      if (city1.main.humidity < city2.main.humidity) city1Score += weights.humidity;
      else city2Score += weights.humidity;
    } else {
      if (city1.main.humidity > city2.main.humidity) city1Score += weights.humidity;
      else city2Score += weights.humidity;
    }

    // Wind Speed
    if (preferences.windSpeed === "low") {
      if (city1.wind.speed < city2.wind.speed) city1Score += weights.windSpeed;
      else city2Score += weights.windSpeed;
    } else {
      if (city1.wind.speed > city2.wind.speed) city1Score += weights.windSpeed;
      else city2Score += weights.windSpeed;
    }

    // Precipitation
    if (preferences.precipitation === "low") {
      if (city1.precipitation < city2.precipitation) city1Score += weights.precipitation;
      else city2Score += weights.precipitation;
    } else {
      if (city1.precipitation > city2.precipitation) city1Score += weights.precipitation;
      else city2Score += weights.precipitation;
    }

    // Air Quality (lower AQI is better)
    if (preferences.airQuality === "low") {
      if (city1.aqi < city2.aqi) city1Score += weights.airQuality;
      else city2Score += weights.airQuality;
    } else {
      if (city1.aqi > city2.aqi) city1Score += weights.airQuality;
      else city2Score += weights.airQuality;
    }

    return city1Score > city2Score ? city1.name : city2.name;
  };

  // Open weight editing modal
  const openEditWeights = () => {
    setTempWeights({ ...weights });
    setEditWeights(true);
  };

  // Save updated weights
  const saveWeights = () => {
    setWeights({ ...tempWeights });
    setEditWeights(false);
  };

  return (
    <div className="App">
      <h1>City Comparison App</h1>
      <button onClick={openEditWeights} className="edit-weights-button">
        Edit Weights
      </button>
      {editWeights && (
        <div className="edit-weights-modal">
          <h2>Edit Weights</h2>
          <label>
            Temperature Weight:
            <input
              type="number"
              step="0.01"
              value={tempWeights.temperature}
              onChange={(e) =>
                setTempWeights({ ...tempWeights, temperature: parseFloat(e.target.value) })
              }
            />
          </label>
          <label>
            Humidity Weight:
            <input
              type="number"
              step="0.01"
              value={tempWeights.humidity}
              onChange={(e) =>
                setTempWeights({ ...tempWeights, humidity: parseFloat(e.target.value) })
              }
            />
          </label>
          <label>
            Wind Speed Weight:
            <input
              type="number"
              step="0.01"
              value={tempWeights.windSpeed}
              onChange={(e) =>
                setTempWeights({ ...tempWeights, windSpeed: parseFloat(e.target.value) })
              }
            />
          </label>
          <label>
            Precipitation Weight:
            <input
              type="number"
              step="0.01"
              value={tempWeights.precipitation}
              onChange={(e) =>
                setTempWeights({ ...tempWeights, precipitation: parseFloat(e.target.value) })
              }
            />
          </label>
          <label>
            Air Quality Weight:
            <input
              type="number"
              step="0.01"
              value={tempWeights.airQuality}
              onChange={(e) =>
                setTempWeights({ ...tempWeights, airQuality: parseFloat(e.target.value) })
              }
            />
          </label>
          <button onClick={saveWeights}>Save</button>
          <button onClick={() => setEditWeights(false)}>Cancel</button>
        </div>
      )}
      <form onSubmit={handleCompare}>
        <div className="preferences">
          <label>
            City 1:
            <input
              type="text"
              value={city1}
              onChange={(e) => setCity1(e.target.value)}
              placeholder="Enter city name"
              required
            />
          </label>
          <label>
            City 2:
            <input
              type="text"
              value={city2}
              onChange={(e) => setCity2(e.target.value)}
              placeholder="Enter city name"
              required
            />
          </label>
          <label>
            Temperature Preference:
            <select
              value={preferences.temperature}
              onChange={(e) =>
                setPreferences({ ...preferences, temperature: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            Humidity Preference:
            <select
              value={preferences.humidity}
              onChange={(e) =>
                setPreferences({ ...preferences, humidity: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            Wind Speed Preference:
            <select
              value={preferences.windSpeed}
              onChange={(e) =>
                setPreferences({ ...preferences, windSpeed: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            Precipitation Preference:
            <select
              value={preferences.precipitation}
              onChange={(e) =>
                setPreferences({ ...preferences, precipitation: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            Air Quality Preference:
            <select
              value={preferences.airQuality}
              onChange={(e) =>
                setPreferences({ ...preferences, airQuality: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Comparing..." : "Compare Cities"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="weather-display" data-testid="weather-display">
        {city1Data && (
          <div className="weather-container">
            <h2>{city1Data.name}</h2>
            <p>Temperature: {city1Data.main.temp}°C</p>
            <p>Humidity: {city1Data.main.humidity}%</p>
            <p>Wind Speed: {city1Data.wind.speed} m/s</p>
            <p>Precipitation: {city1Data.precipitation.toFixed(2)} mm</p>
            <p>Air Quality: {city1Data.aqi || "N/A"}</p>
          </div>
        )}
        {city2Data && (
          <div className="weather-container">
            <h2>{city2Data.name}</h2>
            <p>Temperature: {city2Data.main.temp}°C</p>
            <p>Humidity: {city2Data.main.humidity}%</p>
            <p>Wind Speed: {city2Data.wind.speed} m/s</p>
            <p>Precipitation: {city2Data.precipitation.toFixed(2)} mm</p>
            <p>Air Quality: {city2Data.aqi || "N/A"}</p>
          </div>
        )}
      </div>

      {betterCity && (
        <p className="result">
          The better city based on your preferences is: {betterCity}
        </p>
      )}

      {/* Display Correlation Values (excluding AQI) */}
      {Object.keys(correlations).length > 0 && (
        <div className="correlation-display">
          <h2>Correlation Values</h2>
          {correlations.temperature !== undefined && <p>Temperature: {correlations.temperature}</p>}
          {correlations.humidity !== undefined && <p>Humidity: {correlations.humidity}</p>}
          {correlations.windSpeed !== undefined && <p>Wind Speed: {correlations.windSpeed}</p>}
          {correlations.precipitation !== undefined && <p>Precipitation: {correlations.precipitation}</p>}
        </div>
      )}
    </div>
  );
};

export default Corelation;
