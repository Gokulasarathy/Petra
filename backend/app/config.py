"""
PETRA - Flask Application Configuration
Supports development and production environments.
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'petra-default-secret')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))  # 10MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                  os.environ.get('UPLOAD_FOLDER', 'uploads'))
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'pdf', 'mp3', 'wav', 'ogg'}

    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'petra-jwt-default-secret')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours in seconds


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///petra.db')


class ProductionConfig(Config):
    """Production configuration — Azure SQL, Blob Storage, etc."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///petra.db')
    # In production, override with Azure SQL connection string:
    # SQLALCHEMY_DATABASE_URI = "mssql+pyodbc://..."


# Map environment names to config classes
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}
