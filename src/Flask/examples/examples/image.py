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