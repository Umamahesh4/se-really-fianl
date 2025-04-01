import pytest
from unittest.mock import patch
import pandas as pd
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@patch('app.fetch_current_weather')
def test_weather_endpoint(mock_fetch_weather, client):
    """Test the weather endpoint returns correct status code"""
    mock_weather_data = {
        'main': {'temp': 20.5, 'humidity': 65},
        'weather': [{'description': 'clear sky'}]
    }
    mock_fetch_weather.return_value = mock_weather_data
    
    response = client.get('/weather?lat=40.7128&lon=-74.0060')
    assert response.status_code == 200
    assert 'main' in response.json
    assert 'temp' in response.json['main']

@patch('app.rank_cities')
def test_default_rankings(mock_rank_cities, client):
    """Test the default rankings endpoint"""
    mock_rankings = [
        {'city': 'New York', 'score': 8.5},
        {'city': 'London', 'score': 7.8}
    ]
    mock_rank_cities.return_value = mock_rankings
    
    response = client.get('/ranking/default')
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) > 0
    assert 'city' in response.json[0]
    assert 'score' in response.json[0]

@patch('app.rank_cities')
def test_custom_rankings(mock_rank_cities, client):
    """Test the custom rankings endpoint"""
    mock_rankings = [
        {'city': 'New York', 'score': 8.5},
        {'city': 'London', 'score': 7.8},
        {'city': 'Tokyo', 'score': 8.2}
    ]
    mock_rank_cities.return_value = mock_rankings
    
    test_data = {
        "cities": ["New York", "London", "Tokyo"]
    }
    response = client.post('/ranking/custom', json=test_data)
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) == 3

@patch('app.fetch_historical_weather')
def test_correlation_endpoint(mock_historical_weather, client):
    """Test the correlation endpoint"""
    dates = pd.date_range(start='2024-01-01', periods=4, freq='D')
    mock_data = {
        'date': dates,
        'temp': [20, 22, 21, 23],
        'humidity': [65, 70, 68, 72],
        'pressure': [1012, 1014, 1013, 1015]
    }
    mock_df = pd.DataFrame(mock_data)
    mock_historical_weather.return_value = mock_df
    
    test_data = {
        "city1": "New York",
        "city2": "London",
        "attribute": "temp"
    }
    response = client.post('/correlation', json=test_data)
    assert response.status_code == 200
    assert 'correlation' in response.json
