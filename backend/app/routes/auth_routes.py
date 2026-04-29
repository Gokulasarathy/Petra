"""
Auth Routes
Endpoints for user registration, login, and profile management using JWT.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.utils.validators import validate_user_data

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """Register a new user with a password."""
    data = request.get_json() or {}
    
    # Basic validation (reusing and extending existing validator)
    errors = validate_user_data(data)
    if not data.get('password'):
        errors.append('Password is required.')
    elif len(data.get('password')) < 6:
        errors.append('Password must be at least 6 characters.')
        
    if errors:
        return jsonify({'errors': errors}), 400

    # Check for duplicate email
    existing = User.query.filter_by(email=data['email'].strip()).first()
    if existing:
        return jsonify({'error': 'Email already registered'}), 409

    user = User(
        name=data['name'].strip(),
        email=data['email'].strip(),
        role=data.get('role', 'citizen'),
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    # Generate token immediately after registration
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'access_token': access_token
    }), 201


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Authenticate user and return JWT access token."""
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Create token using user ID as identity
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token
    }), 200


@auth_bp.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user details from JWT token."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify({'user': user.to_dict()}), 200
