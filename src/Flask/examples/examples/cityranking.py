from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import requests
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model
from tensorflow.keras.losses import MeanSquaredError
from tensorflow.keras.utils import CustomObjectScope
import joblib
from datetime import datetime, timedelta
import logging
from PIL import Image
import io
import requests
from geopy.geocoders import Nominatim

# Open-Meteo API (Free historical weather data)
WEATHER_API_URL = "https://archive-api.open-meteo.com/v1/archive"

# Define a fixed date range for historical data
START_DATE = "2024-03-12"
END_DATE = "2024-03-22"

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load the weather forecast model and scaler
with CustomObjectScope({'mse': MeanSquaredError()}):
    forecast_model = load_model('weather_forecast_model.h5')
forecast_scaler = joblib.load('scaler.pkl')

# Load the image classification model
MODEL_PATH = "modellast.pkl"
try:
    image_model = joblib.load(MODEL_PATH)
    print("✅ Image classification model loaded successfully!")
except Exception as e:
    print("❌ Error loading image classification model:", str(e))
    image_model = None

# Class labels for the image classification model
CLASS_LABELS = ["Cloudy", "Rainy", "Sunny", "Sunrise"]
DEFAULT_CITIES = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore"]

# Open-Meteo API URL
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# Geocoder for fetching latitude and longitude
geolocator = Nominatim(user_agent="weather_correlation_app", timeout=25)

def fetch_current_weather(lat, lon):
    """Fetch current weather data from Open-Meteo API using latitude and longitude."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["temperature_2m", "relative_humidity_2m", "pressure_msl", "wind_speed_10m", "cloud_cover", "precipitation"],
        "timezone": "auto"
    }

    response = requests.get(OPEN_METEO_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        current = data.get("current", {})
        weather = {
            "temperature": current.get("temperature_2m", 0),
            "humidity": current.get("relative_humidity_2m", 0),
            "pressure": current.get("pressure_msl", 0),
            "wind_speed": current.get("wind_speed_10m", 0),
            "cloudiness": current.get("cloud_cover", 0),
            "precipitation": current.get("precipitation", 0)
        }
        return weather
    return None

@app.route("/weather", methods=["GET"])
def get_weather():
    """Endpoint to fetch current weather data using latitude and longitude."""
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    if not lat or not lon:
        return jsonify({"error": "Missing latitude or longitude"}), 400

    weather_data = fetch_current_weather(lat, lon)
    if weather_data:
        return jsonify(weather_data)
    else:
        return jsonify({"error": "Failed to fetch weather data"}), 500

# ----------------------------- Helper Functions -----------------------------

def fetch_weather(city):
    """Fetch current weather data from Open-Meteo API for a city."""
    lat, lon = get_coordinates(city)
    if lat is None or lon is None:
        return None

    # Fetch current weather data from Open-Meteo API
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["temperature_2m", "relative_humidity_2m", "pressure_msl", "wind_speed_10m", "cloud_cover", "precipitation"],
        "timezone": "auto"
    }

    response = requests.get(OPEN_METEO_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        current = data.get("current", {})
        weather = {
            "city": city,
            "temperature": current.get("temperature_2m", 0),
            "humidity": current.get("relative_humidity_2m", 0),
            "pressure": current.get("pressure_msl", 0),
            "wind_speed": current.get("wind_speed_10m", 0),
            "cloudiness": current.get("cloud_cover", 0),
            "precipitation": current.get("precipitation", 0)
        }
        return weather
    return None

def rank_cities(cities):
    """Fetch weather data for each city, normalize parameters, and calculate a weighted score."""
    city_data = [fetch_weather(city) for city in cities]
    city_data = [c for c in city_data if c]  # Remove cities that returned no data
    if not city_data:
        return []

    # Weights for each parameter
    weights = {
        "temperature": 0.25,   # higher temperature is better
        "pressure": 0.10,      # higher pressure is considered better
        "precipitation": 0.25, # lower precipitation is better
        "humidity": 0.15,      # lower humidity is better
        "wind_speed": 0.15,    # lower wind speed is better
        "cloudiness": 0.10,    # lower cloudiness is better
    }

    # Normalize positive parameters: temperature and pressure (higher is better)
    for key in ["temperature", "pressure"]:
        values = [c[key] for c in city_data]
        min_val, max_val = min(values), max(values)
        for c in city_data:
            c[f"norm_{key}"] = (c[key] - min_val) / (max_val - min_val) if max_val > min_val else 1

    # Normalize negative parameters: precipitation, humidity, wind_speed, cloudiness (lower is better)
    for key in ["precipitation", "humidity", "wind_speed", "cloudiness"]:
        values = [c[key] for c in city_data]
        min_val, max_val = min(values), max(values)
        for c in city_data:
            c[f"norm_{key}"] = (max_val - c[key]) / (max_val - min_val) if max_val > min_val else 1

    # Compute weighted score
    for c in city_data:
        score = 0
        for key, weight in weights.items():
            score += weight * c[f"norm_{key}"]
        c["score"] = score

    # Sort by score (highest first) and add ranking
    city_data.sort(key=lambda x: x["score"], reverse=True)
    return [{"rank": idx + 1, **city} for idx, city in enumerate(city_data)]

def get_coordinates(city):
    """Fetch latitude & longitude of a city using geopy (Nominatim)."""
    try:
        location = geolocator.geocode(city, exactly_one=True)
        if location:
            print(f"✅ {city}: Latitude={location.latitude}, Longitude={location.longitude}")
            return location.latitude, location.longitude
        else:
            print(f"❌ No results found for {city}")
            return None, None
    except Exception as e:
        print(f"⚠ Geocoding error for {city}: {e}")
        return None, None

# ----------------------------- Endpoints -----------------------------

@app.route("/ranking/default", methods=["GET"])
def get_default_rankings():
    """Endpoint to fetch rankings for default cities."""
    rankings = rank_cities(DEFAULT_CITIES)
    return jsonify(rankings)

@app.route("/ranking/custom", methods=["POST"])
def get_custom_rankings():
    """Endpoint to fetch rankings for custom cities."""
    data = request.json
    selected_cities = data.get("cities", [])
    if not selected_cities:
        return jsonify({"error": "No cities provided"}), 400
    rankings = rank_cities(selected_cities)
    return jsonify(rankings)

# ----------------------------- Main -----------------------------

if __name__ == '__main__':
    app.run(debug=True, port=5001)