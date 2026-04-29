"""
File Handler Service
Manages file uploads — validation, naming, storage.
Abstracted for easy migration to Azure Blob Storage.
"""
import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app


# Allowed MIME types for validation
ALLOWED_MIME_TYPES = {
    'application/pdf': 'pdf',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/x-wav': 'wav',
}


def allowed_file(filename: str) -> bool:
    """Check if a file extension is allowed."""
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in current_app.config['ALLOWED_EXTENSIONS']


def get_file_type(filename: str) -> str:
    """Extract and return the file type from filename."""
    if '.' not in filename:
        return 'unknown'
    return filename.rsplit('.', 1)[1].lower()


def save_file(file) -> dict:
    """
    Save an uploaded file to the local storage.
    
    Args:
        file: FileStorage object from Flask request
    
    Returns:
        dict with 'file_path', 'file_type', 'original_name', 'size'
        or None if validation fails
    """
    if not file or file.filename == '':
        return None

    if not allowed_file(file.filename):
        return {'error': f'File type not allowed. Accepted: {", ".join(current_app.config["ALLOWED_EXTENSIONS"])}'}

    # Generate a unique filename to prevent collisions
    original_name = secure_filename(file.filename)
    file_ext = get_file_type(original_name)
    unique_name = f"{uuid.uuid4().hex}_{original_name}"
    
    # Save to upload directory
    upload_folder = current_app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, unique_name)
    file.save(file_path)

    # Get file size
    file_size = os.path.getsize(file_path)

    return {
        'file_path': unique_name,  # Store relative path, not absolute
        'file_type': file_ext,
        'original_name': original_name,
        'size': file_size,
    }


def delete_file(file_path: str) -> bool:
    """
    Delete a file from local storage.
    
    Args:
        file_path: Relative filename within upload folder
    
    Returns:
        True if deleted, False if file not found
    """
    if not file_path:
        return False
    
    full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_path)
    if os.path.exists(full_path):
        os.remove(full_path)
        return True
    return False


def get_file_path(file_path: str) -> str:
    """
    Get the absolute path for a stored file.
    Used for serving file downloads.
    """
    return os.path.join(current_app.config['UPLOAD_FOLDER'], file_path)
