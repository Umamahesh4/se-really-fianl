import React, { useState } from "react";
import axios from "axios";
import "./ImageClassify.css";

function ImageClassify() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPredictions([]); // Clear predictions immediately
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setFileName(file.name);
      setError("");
      await handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5001/predict_image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      if (response.data && response.data.predictions && response.data.predictions.length > 0) {
        setPredictions(response.data.predictions);
        setError("");
      } else {
        setError("No predictions returned from the API.");
      }
    } catch (error) {
      console.error("Error classifying image:", error);
      setError("Error uploading image. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ImageClassify">
      <h1>Weather Image Recognition</h1>
      <div className="upload-container">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          data-testid="file-input" 
        />
        {fileName && <div>{fileName}</div>}
        {preview && <img src={preview} alt="Preview" className="preview" data-testid="image-preview" />}
        <button onClick={() => handleUpload(selectedFile)} className="upload-btn">
          Predict Weather
        </button>
      </div>
      {isLoading && <div>Classifying...</div>}
      {predictions.length > 0 && (
        <div className="result">
          {predictions.map((pred, index) => (
            <div key={index}>
              <strong>{pred.label}</strong>: {Math.round(pred.confidence * 100)}%
            </div>
          ))}
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default ImageClassify;