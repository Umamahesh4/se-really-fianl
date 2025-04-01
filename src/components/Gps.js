// src/components/Gps.js
import React, { useState, useEffect } from "react";
import GaugeComponent from "./GaugeComponent";
import "./gps.css"; // Import CSS file

const Gps = () => {
  const [weather, setWeather] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [city, setCity] = useState("Your Location");

  // Function to fetch city name using reverse geocoding
  const fetchCityName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      // Extract city name from the response
      const cityName =
        data.address.city || data.address.town || data.address.village || "Unknown Location";
      setCity(cityName);
    } catch (error) {
      console.error("Error fetching city name:", error);
      setCity("Unknown Location");
    }
  };

  useEffect(() => {
    const fetchWeather = async (latitude, longitude) => {
      try {
        // Fetch weather data from the Flask backend
        const response = await fetch(
          `http://localhost:5001/weather?lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        setWeather(data);
        setTimestamp(new Date().toLocaleTimeString());
        console.log("Weather updated at:", new Date().toLocaleTimeString(), data);

        // Fetch city name using reverse geocoding
        fetchCityName(latitude, longitude);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLat(latitude);
            setLon(longitude);
            fetchWeather(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    getLocation();
    const interval = setInterval(getLocation, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="weather-dashboard">
      <h1>Weather Dashboard</h1>
      {weather ? (
        <div>
          <h3>Last Updated: {timestamp}</h3>
          <h2>📍 {city}</h2>
          <p>Coordinates: {lat}, {lon}</p>

          <div className="gauges-container">
            {/* Temperature Gauge */}
            <div className="gauge-item">
              <h4>Temperature</h4>
              <GaugeComponent id="tempGauge" value={weather.temperature} unit="°C" min={-10} max={50} />
              <p>{weather.temperature} °C</p>
            </div>

            {/* Humidity Gauge */}
            <div className="gauge-item">
              <h4>Humidity</h4>
              <GaugeComponent id="humidityGauge" value={weather.humidity} unit="%" min={0} max={100} />
              <p>{weather.humidity} %</p>
            </div>

            {/* Wind Speed Gauge */}
            <div className="gauge-item">
              <h4>Wind Speed</h4>
              <GaugeComponent id="windGauge" value={weather.wind_speed} unit="m/s" min={0} max={20} />
              <p>{weather.wind_speed} m/s</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="loading-message">Loading weather data...</p>
      )}
    </div>
  );
};

export default Gps;