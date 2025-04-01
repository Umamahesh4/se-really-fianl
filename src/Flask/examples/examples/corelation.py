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