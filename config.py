import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dr_grader_secret_key_12345')
    
    # Base directory
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
    # SQLite Database Configuration
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'database.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload Configurations
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB Max Upload Size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    
    # Model Path
    MODEL_PATH = os.path.join(BASE_DIR, 'static', 'model', 'dr_resnet50.h5')
    
    # Ensure directories exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, 'static', 'model'), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, 'static', 'images'), exist_ok=True)
