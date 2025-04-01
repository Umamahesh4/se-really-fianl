module.exports = {
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!axios|react-router-dom|leaflet|react-leaflet|canvas-gauges)/",
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^axios$": "<rootDir>/node_modules/axios/dist/axios.js",
    "^react-router-dom$": "<rootDir>/node_modules/react-router-dom/dist/index.js",
    "^leaflet$": "<rootDir>/node_modules/leaflet/dist/leaflet.js",
    "^react-leaflet$": "<rootDir>/node_modules/react-leaflet/dist/react-leaflet.js",
    "^canvas-gauges$": "<rootDir>/__mocks__/canvas-gauges.js",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "src"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/index.js",
    "!src/reportWebVitals.js",
  ],
};
