"""
StatusLog Model
Tracks the history of status changes for each petition — provides an audit trail.
"""
from datetime import datetime, timezone
from app import db


class StatusLog(db.Model):
    __tablename__ = 'status_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    petition_id = db.Column(db.Integer, db.ForeignKey('petitions.id'), nullable=False)
    old_status = db.Column(db.String(20), nullable=True)
    new_status = db.Column(db.String(20), nullable=False)
    changed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship to user who made the change
    changer = db.relationship('User', backref='status_changes')

    def to_dict(self):
        """Serialize status log to dictionary."""
        return {
            'id': self.id,
            'petition_id': self.petition_id,
            'old_status': self.old_status,
            'new_status': self.new_status,
            'changed_by': self.changed_by,
            'changer_name': self.changer.name if self.changer else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
