"""
Dashboard Routes
Aggregate statistics and analytics endpoints for the admin dashboard.
"""
from flask import Blueprint, jsonify
from sqlalchemy import func
from app import db
from app.models.petition import Petition
from app.models.status_log import StatusLog

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard/stats', methods=['GET'])
def get_stats():
    """
    Get overview statistics for the dashboard.
    Returns total, pending, resolved, and critical petition counts.
    """
    total = Petition.query.count()
    pending = Petition.query.filter(
        Petition.status.in_(['submitted', 'under_review', 'in_progress'])
    ).count()
    resolved = Petition.query.filter_by(status='resolved').count()
    rejected = Petition.query.filter_by(status='rejected').count()
    critical = Petition.query.filter_by(priority='critical').count()

    return jsonify({
        'stats': {
            'total': total,
            'pending': pending,
            'resolved': resolved,
            'rejected': rejected,
            'critical': critical,
            'resolution_rate': round((resolved / total * 100), 1) if total > 0 else 0,
        }
    }), 200


@dashboard_bp.route('/dashboard/status-distribution', methods=['GET'])
def get_status_distribution():
    """
    Get petition count grouped by status.
    Used for the status pie chart.
    """
    results = db.session.query(
        Petition.status,
        func.count(Petition.id).label('count')
    ).group_by(Petition.status).all()

    distribution = [{'status': r.status, 'count': r.count} for r in results]

    return jsonify({'distribution': distribution}), 200


@dashboard_bp.route('/dashboard/priority-distribution', methods=['GET'])
def get_priority_distribution():
    """
    Get petition count grouped by priority.
    Used for the priority bar chart.
    """
    results = db.session.query(
        Petition.priority,
        func.count(Petition.id).label('count')
    ).group_by(Petition.priority).all()

    distribution = [{'priority': r.priority, 'count': r.count} for r in results]

    return jsonify({'distribution': distribution}), 200


@dashboard_bp.route('/dashboard/category-distribution', methods=['GET'])
def get_category_distribution():
    """Get petition count grouped by AI-classified category."""
    results = db.session.query(
        Petition.category,
        func.count(Petition.id).label('count')
    ).group_by(Petition.category).all()

    distribution = [{'category': r.category, 'count': r.count} for r in results]

    return jsonify({'distribution': distribution}), 200


@dashboard_bp.route('/dashboard/recent', methods=['GET'])
def get_recent_activity():
    """
    Get recent petitions and status changes.
    Returns the 10 most recent petitions and 10 most recent status updates.
    """
    recent_petitions = Petition.query.order_by(
        Petition.created_at.desc()
    ).limit(10).all()

    recent_updates = StatusLog.query.order_by(
        StatusLog.created_at.desc()
    ).limit(10).all()

    return jsonify({
        'recent_petitions': [p.to_dict() for p in recent_petitions],
        'recent_updates': [s.to_dict() for s in recent_updates],
    }), 200


@dashboard_bp.route('/dashboard/timeline', methods=['GET'])
def get_timeline():
    """
    Get petition submission counts grouped by date (last 30 days).
    Used for a trend line chart.
    """
    results = db.session.query(
        func.date(Petition.created_at).label('date'),
        func.count(Petition.id).label('count')
    ).group_by(
        func.date(Petition.created_at)
    ).order_by(
        func.date(Petition.created_at).desc()
    ).limit(30).all()

    timeline = [{'date': str(r.date), 'count': r.count} for r in results]

    return jsonify({'timeline': timeline}), 200
