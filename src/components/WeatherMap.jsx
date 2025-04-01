import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from "react-leaflet";
import { useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./WeatherMap.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const WeatherMap = () => {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const API_KEY = "7eeba6a8fe29e05163a9d8011bffcba3";

  const fetchLocationDetails = async (lat, lon) => {
    setIsLoading(true);
    try {
      const locationRes = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const address = locationRes.data.address;
      const city = address.city || address.town || address.village || address.county || "Unknown City";
      const state = address.state || "Unknown State";
      
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      setLocation({ lat, lon, place: `${city}, ${state}` });
      setWeather(weatherRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        fetchLocationDetails(lat, lng);
      },
    });
    return null;
  };

  return (
    <div className="weather-map-container">
      <h1 className="title">
        <i className="fas fa-map-marked-alt"></i> Weather Map
      </h1>
      <MapContainer center={[20, 77]} zoom={4} className="map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler />
        {isLoading && location && (
          <Marker position={[location.lat, location.lon]}>
            <Popup>
              <div className="loader"></div>
            </Popup>
          </Marker>
        )}
        {!isLoading && location && (
          <Marker position={[location.lat, location.lon]}>
            <Popup>
              <div className="card">
                <div className="initial-content">
                  <h3>{location.place}</h3>
                </div>
                <div className="hover-content">
                  <p><strong>Temperature:</strong> {weather?.main?.temp}°C</p>
                  <p><strong>Feels Like:</strong> {weather?.main?.feels_like}°C</p>
                  <p><strong>Weather:</strong> {weather?.weather[0]?.description}</p>
                  <p><strong>Humidity:</strong> {weather?.main?.humidity}%</p>
                  <p><strong>Wind Speed:</strong> {weather?.wind?.speed} m/s</p>
                  <p><strong>Pressure:</strong> {weather?.main?.pressure} hPa</p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default WeatherMap;