from flask import Flask
from routes import register_routes
from flask_cors import CORS
from services.startup_generator import auto_generate_images
import os


app = Flask(__name__)   
CORS(app)

register_routes(app)

if os.getenv("AUTO_GENERATE", "true") == "true":
    with app.app_context():
        auto_generate_images()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
