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
START_DATE = "2024-03-10"
END_DATE = "2024-03-19"

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
DEFAULT_CITIES = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"]

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





@app.route('/correlation', methods=['POST'])
def get_correlation():
    """Endpoint to compute correlation between weather attributes for two cities."""
    print("🔍 Received request at /correlation")
    
    data = request.json
    city1, city2, attribute = data.get("city1"), data.get("city2"), data.get("attribute")

    print(f"📌 Data received: city1={city1}, city2={city2}, attribute={attribute}")

    if not city1 or not city2 or not attribute:
        return jsonify({"error": "Missing required parameters"}), 400

    df1 = fetch_historical_weather(city1)
    df2 = fetch_historical_weather(city2)

    if df1 is None or df2 is None:
        return jsonify({"error": "One or both cities not found!"}), 404

    if attribute not in df1.columns or attribute not in df2.columns:
        return jsonify({"error": "Invalid attribute"}), 400

    df = pd.merge(df1, df2, on="date", suffixes=(f"{city1}", f"{city2}"))

    if df.empty:
        return jsonify({"error": "No common data available"}), 404

    print("📊 Weather Data:")
    print(df)

    correlation = df[f"{attribute}{city1}"].corr(df[f"{attribute}{city2}"])
    
    print(f"📈 Correlation between {city1} and {city2} ({attribute}): {correlation}")

    return jsonify({
        "city1": city1,
        "city2": city2,
        "attribute": attribute,
        "correlation": round(correlation, 2)
    })


def fetch_historical_weather(city):
    """Fetch historical weather data for a city."""
    lat, lon = get_coordinates(city)
    if lat is None or lon is None:
        return None

    print(f"✅ {city}: Latitude={lat}, Longitude={lon}")

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": START_DATE,
        "end_date": END_DATE,
        "daily": [
            "temperature_2m_max", "temperature_2m_min", "precipitation_sum",
            "relative_humidity_2m_mean", "windspeed_10m_max"
        ],  # Removed "pressure" (not available in Open-Meteo)
        "timezone": "Asia/Kolkata"
    }

    response = requests.get(WEATHER_API_URL, params=params)

    if response.status_code != 200:
        print(f"❌ Failed to fetch weather data for {city}: {response.text}")
        return None

    weather_data = response.json()
    if "daily" not in weather_data:
        print(f"❌ No daily weather data found for {city}")
        return None

    print(f"🌤 Weather data received for {city}")

    daily = weather_data["daily"]
    df = pd.DataFrame({
        "date": daily["time"],
        "temperature": [(max_t + min_t) / 2 for max_t, min_t in zip(daily["temperature_2m_max"], daily["temperature_2m_min"])],
        "precipitation": daily["precipitation_sum"],
        "humidity": daily["relative_humidity_2m_mean"],
        "windspeed": daily["windspeed_10m_max"]
    })

    return df
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
    return 


@app.route('/predict2', methods=['POST'])
def predict_weather():
    """
    API endpoint to predict weather for a new city.
    """
    try:
        data = request.json
        if 'city_name' not in data:
            return jsonify({"error": "Missing 'city_name' in request body"}), 400

        city_name = data['city_name']
        now = datetime.now()
        end_time = now
        start_time = now - timedelta(hours=24)

        # Get latitude and longitude for the city
        latitude, longitude = get_lat_lon_from_city(city_name)
        if latitude is None or longitude is None:
            return jsonify({"error": "Failed to fetch location data for the city"}), 500

        logger.debug(f"Fetching data for latitude={latitude}, longitude={longitude}, start_time={start_time}, end_time={end_time}")
        new_city_data = fetch_open_meteo_data(latitude, longitude, start_time, end_time)
        if new_city_data is None:
            return jsonify({"error": "Failed to fetch data from Open-Meteo API"}), 500

        new_city_data['datetime'] = pd.to_datetime(new_city_data['datetime'])
        processed_new_city_data = new_city_data[(new_city_data['datetime'] >= (now - timedelta(hours=24))) & (new_city_data['datetime'] <= now)]
        processed_new_city_data = processed_new_city_data.tail(24)

        if len(processed_new_city_data) < 24:
            return jsonify({"error": "Insufficient data for prediction"}), 400

        predictions = predict_new_city_weather(processed_new_city_data)
        prediction_columns = ['temperature', 'humidity', 'pressure', 'cloud_cover', 'weather_code', 'wind_speed']
        predictions_df = pd.DataFrame(predictions, columns=prediction_columns)

        return jsonify(predictions_df.to_dict(orient='records'))
    except Exception as e:
        logger.error(f"Error in /predict-weather endpoint: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
def fetch_open_meteo_data(latitude, longitude, start_date, end_date):
    """
    Fetches historical weather data from the Open-Meteo API.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "temperature_2m,relativehumidity_2m,pressure_msl,cloudcover,windspeed_10m",
        "start_date": start_date.strftime('%Y-%m-%d'),
        "end_date": end_date.strftime('%Y-%m-%d'),
    }
    
    try:
        response = requests.get(OPEN_METEO_URL, params=params)
        response.raise_for_status()  # Raise an error for bad status codes
        data = response.json()
        
        weather_data = []
        for i in range(len(data['hourly']['time'])):
            weather_data.append([
                data['hourly']['time'][i],
                data['hourly']['temperature_2m'][i],
                data['hourly']['relativehumidity_2m'][i],
                data['hourly']['pressure_msl'][i],
                data['hourly']['cloudcover'][i],
                1 if data['hourly']['cloudcover'][i] < 20 else 0,  # Simplified weather code
                data['hourly']['windspeed_10m'][i],
            ])
        
        df = pd.DataFrame(weather_data, columns=[
            'datetime', 'temperature', 'humidity', 'pressure', 'cloud_cover', 'weather_code', 'wind_speed'
        ])
        return df
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch data from Open-Meteo API: {e}")
        logger.error(f"API Response: {response.text if 'response' in locals() else 'No response'}")
        return None

def get_lat_lon_from_city(city_name):
    """
    Fetches latitude and longitude for a city using Open-Meteo's Geocoding API.
    Returns a tuple of (latitude, longitude) as floats.
    """
    base_url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        "name": city_name,
        "count": 1,  # Limit to 1 result
        "format": "json",
    }
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise an error for bad status codes
        data = response.json()
        if data.get("results"):
            # Return the latitude and longitude of the first result
            return float(data["results"][0]["latitude"]), float(data["results"][0]["longitude"])
        else:
            print(f"No results found for city: {city_name}")
            return None, None
    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch data from Open-Meteo Geocoding API: {e}")
        return None, None
    
def preprocess_new_city_data(new_city_data):
    """
    Preprocesses the new city data using the saved scaler.
    """
    weather_data = new_city_data.drop(columns=['datetime'])
    scaled_data = forecast_scaler.transform(weather_data)
    return scaled_data

def predict_new_city_weather(new_city_data):
    """
    Predicts the next 6 hours of weather data.
    """
    new_city_data_normalized = preprocess_new_city_data(new_city_data)
    last_sequence = new_city_data_normalized[-24:]
    last_sequence = np.expand_dims(last_sequence, axis=0)
    predictions = forecast_model.predict(last_sequence)
    predictions = predictions.reshape(-1, predictions.shape[2])
    predictions = forecast_scaler.inverse_transform(predictions)
    return predictions


@app.route("/predict_image", methods=["POST"])
def predict_image():
    """Endpoint for weather classification using the ML model."""
    print("🔮 Received prediction request")

    if "file" not in request.files:
        print("❌ No file found in request")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    try:
        # Read the file and preprocess
        image = Image.open(io.BytesIO(file.read()))
        processed_image = preprocess_image(image)

        if image_model is None:
            print("❌ Image classification model not loaded")
            return jsonify({"error": "Model not available"}), 500

        # Make a prediction
        prediction = image_model.predict(processed_image)
        print("📊 Prediction probabilities:", prediction)

        predicted_class = CLASS_LABELS[np.argmax(prediction)]
        print("✅ Predicted Class:", predicted_class)

        return jsonify({"prediction": predicted_class})

    except Exception as e:
        print("❌ Error during prediction:", str(e))
        return jsonify({"error": str(e)}), 500
def preprocess_image(image):
    """Preprocess image to match model input format."""
    image = image.convert("RGB")  # Ensure RGB mode
    image = image.resize((150, 150))  # Resize to (150, 150) as expected by model
    image = np.array(image, dtype=np.float32) / 255.0  # Normalize pixel values
    image = np.expand_dims(image, axis=0)  # Add batch dimension (1, 150, 150, 3)
    return image

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