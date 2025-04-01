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