import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import LSTM from "../lstm"; // Adjust path based on your folder structure

// At the top of lstm.test.jsx
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: [] })),
}));

describe("LSTM Component", () => {
  test("renders input field and predict button", () => {
      const { debug } = render(<LSTM />);
      debug(); // Log the rendered output for debugging
      expect(screen.getByPlaceholderText("Enter city name")).toBeInTheDocument();
      expect(screen.getByText("Predict")).toBeInTheDocument();
      expect(screen.getByText("Predict")).toBeInTheDocument();
  });

  test("updates input value when user types", () => {
    render(<LSTM />);
    const input = screen.getByPlaceholderText("Enter city name");
    fireEvent.change(input, { target: { value: "Los Angeles" } });
    expect(input.value).toBe("Los Angeles");
  });

  test("makes API request and displays predictions on successful fetch", async () => {
    const mockData = [
      {
        temperature: "22°C",
        humidity: "55%",
        pressure: "1010 hPa",
        cloud_cover: "30%",
        weather_code: "Partly Cloudy",
        wind_speed: "12 km/h",
      },
    ];

    axios.post.mockResolvedValueOnce({ data: mockData });

    render(<LSTM />);
    const input = screen.getByPlaceholderText("Enter city name");
    fireEvent.change(input, { target: { value: "Los Angeles" } });
    fireEvent.click(screen.getByText("Predict"));

    await waitFor(() => {
      expect(screen.getByText("22°C")).toBeInTheDocument();
      expect(screen.getByText("55%")).toBeInTheDocument();
      expect(screen.getByText("1010 hPa")).toBeInTheDocument();
      expect(screen.getByText("Partly Cloudy")).toBeInTheDocument();
    });
  });

  test("displays error message when API request fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("API error"));

    render(<LSTM />);
    fireEvent.change(screen.getByPlaceholderText("Enter city name"), { target: { value: "UnknownCity" } });
    fireEvent.click(screen.getByText("Predict"));

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch predictions")).toBeInTheDocument();
    });
  });
});
