import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import ImageClassify from '../ImageClassify';

jest.mock('axios', () => ({
  post: jest.fn(),
}));

global.URL.createObjectURL = jest.fn(() => 'mock-preview-url');

describe('ImageClassify Component', () => {
  const mockImageFile = new File(['test'], 'test.png', { type: 'image/png' });
  const mockResponse = {
    data: {
      predictions: [
        { label: 'sunny', confidence: 0.95 },
        { label: 'cloudy', confidence: 0.05 },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL.mockClear();
    global.URL.createObjectURL = jest.fn(() => 'mock-preview-url');
  });

  test('renders component with title', () => {
    render(<ImageClassify />);
    expect(screen.getByText('Weather Image Recognition')).toBeInTheDocument();
  });

  test('handles file upload', async () => {
    render(<ImageClassify />);
    
    const fileInput = screen.getByTestId('file-input');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockImageFile] } });
    });

    expect(screen.getByText('test.png')).toBeInTheDocument();
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockImageFile);
  });

  test('displays image preview', async () => {
    render(<ImageClassify />);
    
    const fileInput = screen.getByTestId('file-input');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockImageFile] } });
    });

    const preview = screen.getByTestId('image-preview');
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveAttribute('src', 'mock-preview-url');
  });

  

  test('handles API error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.post.mockRejectedValueOnce(new Error('API Error'));

    render(<ImageClassify />);
    
    const fileInput = screen.getByTestId('file-input');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockImageFile] } });
    });

    await waitFor(() => {
      expect(screen.getByText('Error uploading image. Check console for details.')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  test('displays loading state during API call', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = () => resolve(mockResponse);
    });
    axios.post.mockReturnValueOnce(promise);

    render(<ImageClassify />);
    
    const fileInput = screen.getByTestId('file-input');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockImageFile] } });
    });

    expect(screen.getByText('Classifying...')).toBeInTheDocument();

    await act(async () => {
      resolvePromise();
      await promise;
    });

    await waitFor(() => {
      expect(screen.getByText(/sunny/)).toBeInTheDocument();
    });
  });


});