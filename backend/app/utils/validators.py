"""
Request Validators
Utility functions for validating API request data.
"""

VALID_STATUSES = ['submitted', 'under_review', 'in_progress', 'resolved', 'rejected']
VALID_PRIORITIES = ['low', 'medium', 'high', 'critical']
VALID_ROLES = ['citizen', 'admin', 'officer']


def validate_petition_data(data: dict) -> list:
    """
    Validate petition creation request data.
    Returns list of error messages (empty if valid).
    """
    errors = []

    if not data.get('title', '').strip():
        errors.append('Title is required.')
    elif len(data['title']) > 200:
        errors.append('Title must be 200 characters or less.')

    if not data.get('description', '').strip():
        errors.append('Description is required.')

    return errors


def validate_status_update(data: dict) -> list:
    """Validate status update request data."""
    errors = []

    status = data.get('status', '')
    if not status:
        errors.append('Status is required.')
    elif status not in VALID_STATUSES:
        errors.append(f'Invalid status. Must be one of: {", ".join(VALID_STATUSES)}')

    return errors


def validate_user_data(data: dict) -> list:
    """Validate user creation request data."""
    errors = []

    if not data.get('name', '').strip():
        errors.append('Name is required.')

    email = data.get('email', '').strip()
    if not email:
        errors.append('Email is required.')
    elif '@' not in email or '.' not in email:
        errors.append('Invalid email format.')

    role = data.get('role', 'citizen')
    if role not in VALID_ROLES:
        errors.append(f'Invalid role. Must be one of: {", ".join(VALID_ROLES)}')

    return errors
