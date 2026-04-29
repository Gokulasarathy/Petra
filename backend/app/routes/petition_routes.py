"""
Petition Routes
CRUD endpoints for petition management with AI classification integration.
"""
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.petition import Petition
from app.models.status_log import StatusLog
from app.services.ai_classifier import classify_petition
from app.services.priority_engine import calculate_priority
from app.services.file_handler import save_file, delete_file
from app.utils.validators import validate_petition_data, validate_status_update

petition_bp = Blueprint('petitions', __name__)


@petition_bp.route('/petitions', methods=['POST'])
@jwt_required()
def create_petition():
    """
    Create a new petition.
    Accepts multipart form data (for file uploads) or JSON.
    Automatically runs AI classification and priority scoring.
    """
    # Handle both form data and JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = {
            'title': request.form.get('title', ''),
            'description': request.form.get('description', ''),
            'category': request.form.get('category', ''),
            'submitted_by': request.form.get('submitted_by'),
        }
        file = request.files.get('file')
    else:
        data = request.get_json() or {}
        file = None

    # Validate
    errors = validate_petition_data(data)
    if errors:
        return jsonify({'errors': errors}), 400

    # AI Classification
    classification = classify_petition(data['description'])
    ai_category = classification['category']
    ai_confidence = classification['confidence']

    # Use AI category if user didn't specify one
    category = data.get('category') or ai_category

    # Priority Scoring
    priority_result = calculate_priority(data['description'], category)

    # Handle file upload
    file_path = None
    file_type = None
    if file:
        file_result = save_file(file)
        if file_result and 'error' in file_result:
            return jsonify({'error': file_result['error']}), 400
        if file_result:
            file_path = file_result['file_path']
            file_type = file_result['file_type']

    # Create petition record
    petition = Petition(
        title=data['title'].strip(),
        description=data['description'].strip(),
        category=category,
        ai_category=ai_category,
        ai_confidence=ai_confidence,
        priority=priority_result['priority'],
        priority_score=priority_result['score'],
        status='submitted',
        file_path=file_path,
        file_type=file_type,
        submitted_by=get_jwt_identity(),
    )

    db.session.add(petition)
    db.session.flush()  # Get the ID before commit

    # Create initial status log
    status_log = StatusLog(
        petition_id=petition.id,
        old_status=None,
        new_status='submitted',
        notes='Petition submitted',
    )
    db.session.add(status_log)
    db.session.commit()

    return jsonify({
        'message': 'Petition created successfully',
        'petition': petition.to_dict(),
        'ai_classification': classification,
        'priority_analysis': priority_result,
    }), 201


@petition_bp.route('/petitions', methods=['GET'])
def get_all_petitions():
    """
    Get all petitions with optional filtering and pagination.
    Query params: status, priority, category, page, per_page, search
    """
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 100)  # Cap at 100

    # Build query with filters
    query = Petition.query

    # Filter by status
    status = request.args.get('status')
    if status:
        query = query.filter(Petition.status == status)

    # Filter by priority
    priority = request.args.get('priority')
    if priority:
        query = query.filter(Petition.priority == priority)

    # Filter by category
    category = request.args.get('category')
    if category:
        query = query.filter(Petition.category == category)

    # Search in title and description
    search = request.args.get('search')
    if search:
        search_term = f'%{search}%'
        query = query.filter(
            db.or_(
                Petition.title.ilike(search_term),
                Petition.description.ilike(search_term),
            )
        )

    # Order by creation date (newest first)
    query = query.order_by(Petition.created_at.desc())

    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'petitions': [p.to_dict() for p in pagination.items],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev,
        }
    }), 200


@petition_bp.route('/petitions/<int:petition_id>', methods=['GET'])
def get_petition(petition_id):
    """Get a single petition by ID with full details."""
    petition = Petition.query.get(petition_id)
    if not petition:
        return jsonify({'error': 'Petition not found'}), 404

    return jsonify({'petition': petition.to_dict()}), 200


@petition_bp.route('/petitions/<int:petition_id>/status', methods=['PUT'])
@jwt_required()
def update_petition_status(petition_id):
    """
    Update the status of a petition.
    Creates an audit log entry for every status change.
    """
    petition = Petition.query.get(petition_id)
    if not petition:
        return jsonify({'error': 'Petition not found'}), 404

    data = request.get_json() or {}
    errors = validate_status_update(data)
    if errors:
        return jsonify({'errors': errors}), 400

    old_status = petition.status
    new_status = data['status']

    # Update petition status
    petition.status = new_status

    # Create status log entry
    status_log = StatusLog(
        petition_id=petition.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=get_jwt_identity(),
        notes=data.get('notes', ''),
    )
    db.session.add(status_log)
    db.session.commit()

    return jsonify({
        'message': f'Status updated from "{old_status}" to "{new_status}"',
        'petition': petition.to_dict(),
    }), 200


@petition_bp.route('/petitions/<int:petition_id>', methods=['DELETE'])
@jwt_required()
def delete_petition(petition_id):
    """Delete a petition and its associated file."""
    petition = Petition.query.get(petition_id)
    if not petition:
        return jsonify({'error': 'Petition not found'}), 404

    # Delete attached file if exists
    if petition.file_path:
        delete_file(petition.file_path)

    db.session.delete(petition)
    db.session.commit()

    return jsonify({'message': 'Petition deleted successfully'}), 200


@petition_bp.route('/petitions/<int:petition_id>/file', methods=['GET'])
def download_file(petition_id):
    """Download the file attached to a petition."""
    petition = Petition.query.get(petition_id)
    if not petition or not petition.file_path:
        return jsonify({'error': 'File not found'}), 404

    return send_from_directory(
        current_app.config['UPLOAD_FOLDER'],
        petition.file_path,
        as_attachment=True,
    )
