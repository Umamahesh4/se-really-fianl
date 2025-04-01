import React, { useState } from "react";
import axios from "axios";

const LSTM = () => {
  const [city, setCity] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    setError(""); // Clear previous errors
    setPredictions([]); // Clear previous predictions
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }
    try {
      const response = await axios.post("http://127.0.0.1:5001/predict2", {
        city_name: city, // Send city_name instead of latitude and longitude
      });
      setPredictions(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch predictions");
      setPredictions([]);
    }
  };

  return (
    <div>
      <h1>Weather Forecast</h1>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => {
          setCity(e.target.value);
          setError(""); // Clear error when user types
          setPredictions([]); // Clear predictions when user types
        }}
        data-testid="city-input"
      />
      <button onClick={handlePredict} data-testid="predict-button">
        Predict
      </button>

      {error && <p style={{ color: "red" }} data-testid="error-message">{error}</p>}

      {predictions.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Temperature</th>
              <th>Humidity</th>
              <th>Pressure</th>
              <th>Cloud Cover</th>
              <th>Weather Code</th>
              <th>Wind Speed</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((pred, index) => (
              <tr key={index}>
                <td>{pred.temperature}</td>
                <td>{pred.humidity}</td>
                <td>{pred.pressure}</td>
                <td>{pred.cloud_cover}</td>
                <td>{pred.weather_code}</td>
                <td>{pred.wind_speed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LSTM;