"""
User Routes
Basic user management endpoints.
"""
from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from app.utils.validators import validate_user_data

user_bp = Blueprint('users', __name__)


@user_bp.route('/users', methods=['POST'])
def create_user():
    """Create a new user."""
    data = request.get_json() or {}

    errors = validate_user_data(data)
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

    db.session.add(user)
    db.session.commit()

    return jsonify({
        'message': 'User created successfully',
        'user': user.to_dict(),
    }), 201


@user_bp.route('/users', methods=['GET'])
def get_users():
    """Get all users, optionally filtered by role."""
    role = request.args.get('role')
    query = User.query

    if role:
        query = query.filter(User.role == role)

    users = query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200


@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get a single user by ID."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200
