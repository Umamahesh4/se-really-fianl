import React, { useState } from "react";
import { Line, Bar, Radar, PolarArea, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "./Trend.css";

Chart.register(...registerables);

const WeatherDashboard = () => {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filteredData, setFilteredData] = useState(null);
    const [summaryStats, setSummaryStats] = useState(null);
    const [selectedMetrics, setSelectedMetrics] = useState({
        temperature_2m_max: false,
        temperature_2m_min: false,
        wind_speed_10m_max: false,
        precipitation_sum: false,
        relative_humidity_2m_max: false,
        surface_pressure_max: false,
        uv_index_max: false,
    });
    const [chartType, setChartType] = useState("line");
    const [insights, setInsights] = useState("");

    const fetchWeather = async () => {
        if (!city) return;
        setLoading(true);

        try {
            const geocodeRes = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=3a70ed1e276844109138da3d6f4c531a`
            );
            const geocodeData = await geocodeRes.json();

            if (geocodeData.results.length === 0) {
                alert("City not found. Try another city.");
                setLoading(false);
                return;
            }

            const { lat, lng } = geocodeData.results[0].geometry;
            const endDate = new Date().toISOString().split("T")[0];
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 20);
            const formattedStartDate = startDate.toISOString().split("T")[0];

            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&start_date=${formattedStartDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_max,surface_pressure_max,uv_index_max,sunrise,sunset&timezone=auto`
            );

            const weatherData = await weatherRes.json();
            setWeather(weatherData);
            setFilteredData(weatherData.daily);
            calculateSummaryStats(weatherData.daily);
            generateInsights(weatherData.daily);
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to fetch weather data.");
        }

        setLoading(false);
    };

    const calculateSummaryStats = (data) => {
        const stats = {
            // Temperature stats
            maxTemp: Math.max(...data.temperature_2m_max).toFixed(1),
            minTemp: Math.min(...data.temperature_2m_min).toFixed(1),
            avgMaxTemp: (data.temperature_2m_max.reduce((a, b) => a + b, 0) / data.temperature_2m_max.length).toFixed(1),
            avgMinTemp: (data.temperature_2m_min.reduce((a, b) => a + b, 0) / data.temperature_2m_min.length).toFixed(1),
            
            // Wind stats
            maxWind: Math.max(...data.wind_speed_10m_max).toFixed(1),
            avgWind: (data.wind_speed_10m_max.reduce((a, b) => a + b, 0) / data.wind_speed_10m_max.length).toFixed(1),
            
            // Precipitation stats
            totalPrecipitation: data.precipitation_sum.reduce((a, b) => a + b, 0).toFixed(1),
            maxPrecipitation: Math.max(...data.precipitation_sum).toFixed(1),
            
            // Humidity stats
            maxHumidity: Math.max(...data.relative_humidity_2m_max).toFixed(0),
            avgHumidity: (data.relative_humidity_2m_max.reduce((a, b) => a + b, 0) / data.relative_humidity_2m_max.length).toFixed(0),
            
            // Pressure stats
            maxPressure: Math.max(...data.surface_pressure_max).toFixed(0),
            minPressure: Math.min(...data.surface_pressure_max).toFixed(0),
            
            // UV Index stats
            maxUV: Math.max(...data.uv_index_max).toFixed(1),
            avgUV: (data.uv_index_max.reduce((a, b) => a + b, 0) / data.uv_index_max.length).toFixed(1),
            
            // Date range
            startDate: data.time[0],
            endDate: data.time[data.time.length - 1],
            totalDays: data.time.length
        };
        
        setSummaryStats(stats);
    };

    const generateInsights = (data) => {
        let insightsText = "";

        const maxWindSpeed = Math.max(...data.wind_speed_10m_max);
        const maxTemp = Math.max(...data.temperature_2m_max);
        const maxUV = Math.max(...data.uv_index_max);

        if (maxWindSpeed > 50) {
            insightsText += "⚠️ Strong winds detected—possible storm ahead! 🌪️ ";
        }
        if (maxTemp > 38) {
            insightsText += "🔥 Heatwave warning! Stay hydrated! ";
        }
        if (maxUV > 8) {
            insightsText += "🌞 High UV Index—wear sunscreen & stay indoors during peak hours! ";
        }
        if (data.precipitation_sum.some((p) => p > 20)) {
            insightsText += "🌧️ Heavy rainfall expected—carry an umbrella! ";
        }

        setInsights(insightsText || "✅ No extreme weather conditions detected.");
    };

    const convertToTimeFormat = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    const handleMetricChange = (metric) => {
        setSelectedMetrics((prevState) => ({
            ...prevState,
            [metric]: !prevState[metric],
        }));
    };

    const chartData = {
        labels: filteredData?.time || [],
        datasets: Object.keys(selectedMetrics)
            .filter((metric) => selectedMetrics[metric])
            .map((metric, index) => ({
                label: metric.replace(/_/g, " "),
                data: filteredData ? filteredData[metric] : [],
                borderColor: [
                    "#FF6384", // Bright Red
                    "#36A2EB", // Bright Blue
                    "#FFCE56", // Bright Yellow
                    "#4BC0C0", // Bright Teal
                    "#9966FF", // Bright Purple
                    "#FF9F40", // Bright Orange
                    "#C9CBCF", // Light Gray
                    "#FF6F61", // Coral
                    "#6B5B95", // Muted Purple
                    "#88B04B", // Olive Green
                    "#F7CAC9", // Soft Pink
                    "#92A8D1", // Soft Blue
                ][index % 12],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)", // Bright Red
                    "rgba(54, 162, 235, 0.2)", // Bright Blue
                    "rgba(255, 206, 86, 0.2)", // Bright Yellow
                    "rgba(75, 192, 192, 0.2)", // Bright Teal
                    "rgba(153, 102, 255, 0.2)", // Bright Purple
                    "rgba(255, 159, 64, 0.2)", // Bright Orange
                    "rgba(201, 203, 207, 0.2)", // Light Gray
                    "rgba(255, 111, 97, 0.2)", // Coral
                    "rgba(107, 91, 149, 0.2)", // Muted Purple
                    "rgba(136, 176, 75, 0.2)", // Olive Green
                    "rgba(247, 202, 201, 0.2)", // Soft Pink
                    "rgba(146, 168, 209, 0.2)", // Soft Blue
                ][index % 12],
                fill: true,
            })),
    };

    const renderChart = () => {
        switch (chartType) {
            case "line":
                return <Line data={chartData} />;
            case "bar":
                return <Bar data={chartData} />;
            case "radar":
                return (
                    <div className="small-chart-container">
                        <Radar data={chartData} />
                    </div>
                );
            case "polarArea":
                return (
                    <div className="small-chart-container">
                        <PolarArea data={chartData} />
                    </div>
                );
            case "doughnut":
                return (
                    <div className="small-chart-container">
                        <Doughnut data={chartData} />
                    </div>
                );
            default:
                return <Line data={chartData} />;
        }
    };

    return (
        <div className="weather-container">
            <h1 className="title">📊 Weather Trend Analysis</h1>

            <div className="search-box">
                <input type="text" placeholder="Enter city name..." value={city} onChange={(e) => setCity(e.target.value)} />
                <button onClick={fetchWeather}>Get Weather</button>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-container">
                        <div className="loader">
                            <div className="loader__bar"></div>
                            <div className="loader__bar"></div>
                            <div className="loader__bar"></div>
                            <div className="loader__bar"></div>
                            <div className="loader__bar"></div>
                            <div className="loader__ball"></div>
                        </div>
                        <p>Fetching data...</p>
                    </div>
                </div>
            )}

            {weather && summaryStats && (
                <>
                    <div className="weather-card">
                        <h2>🌍 {city}</h2>
                        <p className="weather-alert">{insights}</p>
                        
                        <div className="summary-stats">
                            <div className="stats-period">
                                <h3>Weather Summary ({summaryStats.startDate} to {summaryStats.endDate})</h3>
                            </div>
                            
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-label">🌡️ Max Temp:</span>
                                    <span className="stat-value">{summaryStats.maxTemp}°C</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">🌡️ Min Temp:</span>
                                    <span className="stat-value">{summaryStats.minTemp}°C</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">🌡️ Avg Max:</span>
                                    <span className="stat-value">{summaryStats.avgMaxTemp}°C</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">🌡️ Avg Min:</span>
                                    <span className="stat-value">{summaryStats.avgMinTemp}°C</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">💨 Max Wind:</span>
                                    <span className="stat-value">{summaryStats.maxWind} km/h</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">💨 Avg Wind:</span>
                                    <span className="stat-value">{summaryStats.avgWind} km/h</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">🌧️ Overall Rainfall:</span>
                                    <span className="stat-value">{summaryStats.totalPrecipitation} mm</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">💧 Max Humidity:</span>
                                    <span className="stat-value">{summaryStats.maxHumidity}%</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">☀️ Max UV:</span>
                                    <span className="stat-value">{summaryStats.maxUV}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weather Data Table */}
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Max Temp (°C)</th>
                                <th>Min Temp (°C)</th>
                                <th>Wind Speed (km/h)</th>
                                <th>Precipitation (mm)</th>
                                <th>Humidity (%)</th>
                                <th>Pressure (hPa)</th>
                                <th>UV Index</th>
                                <th>Sunrise</th>
                                <th>Sunset</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData?.time.map((date, index) => (
                                <tr key={index}>
                                    <td>{date}</td>
                                    <td>{filteredData.temperature_2m_max[index]}</td>
                                    <td>{filteredData.temperature_2m_min[index]}</td>
                                    <td>{filteredData.wind_speed_10m_max[index]}</td>
                                    <td>{filteredData.precipitation_sum[index]}</td>
                                    <td>{filteredData.relative_humidity_2m_max[index]}</td>
                                    <td>{filteredData.surface_pressure_max[index]}</td>
                                    <td>{filteredData.uv_index_max[index]}</td>
                                    <td>{convertToTimeFormat(filteredData.sunrise[index])}</td>
                                    <td>{convertToTimeFormat(filteredData.sunset[index])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Filters ABOVE the chart */}
                    <div className="chart-filters">
                        <label>Select Metrics: </label>
                        <div className="metric-checkboxes">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedMetrics.temperature_2m_max}
                                    onChange={() => handleMetricChange("temperature_2m_max")}
                                />
                                Max Temperature (°C)
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedMetrics.temperature_2m_min}
                                    onChange={() => handleMetricChange("temperature_2m_min")}
                                />
                                Min Temperature (°C)
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedMetrics.wind_speed_10m_max}
                                    onChange={() => handleMetricChange("wind_speed_10m_max")}
                                />
                                Wind Speed (km/h)
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedMetrics.precipitation_sum}
                                    onChange={() => handleMetricChange("precipitation_sum")}
                                />
                                Precipitation (mm)
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedMetrics.relative_humidity_2m_max}
                                    onChange={() => handleMetricChange("relative_humidity_2m_max")}
                                />
                                Humidity (%)
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedMetrics.surface_pressure_max}
                                    onChange={() => handleMetricChange("surface_pressure_max")}
                                />
                                Pressure (hPa)
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedMetrics.uv_index_max}
                                    onChange={() => handleMetricChange("uv_index_max")}
                                />
                                UV Index
                            </label>
                        </div>

                        <label>📊 Select Chart Type: </label>
                        <select onChange={(e) => setChartType(e.target.value)}>
                            <option value="line">Line Chart</option>
                            <option value="bar">Bar Chart</option>
                            <option value="radar">Radar Chart</option>
                            <option value="polarArea">Polar Area Chart</option>
                            <option value="doughnut">Doughnut Chart</option>
                        </select>
                    </div>

                    {/* Chart Display BELOW the filters */}
                    <div className="chart-container">{renderChart()}</div>
                </>
            )}
        </div>
    );
};

export default WeatherDashboard;