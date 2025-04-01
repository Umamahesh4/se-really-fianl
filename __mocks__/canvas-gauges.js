// __mocks__/canvas-gauges.js
export const RadialGauge = jest.fn().mockImplementation(() => ({
    draw: jest.fn(),
    update: jest.fn(),
    value: 0,
  }));
  