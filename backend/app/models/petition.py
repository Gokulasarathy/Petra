"""
Petition Model
Core entity — represents a submitted petition with AI classification metadata.
"""
from datetime import datetime, timezone
from app import db


class Petition(db.Model):
    __tablename__ = 'petitions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Classification
    category = db.Column(db.String(50), default='other')
    ai_category = db.Column(db.String(50), nullable=True)
    ai_confidence = db.Column(db.Float, nullable=True)
    
    # Priority
    priority = db.Column(db.String(20), default='medium')  # critical, high, medium, low
    priority_score = db.Column(db.Float, default=0.0)
    
    # Status tracking
    status = db.Column(db.String(20), default='submitted')
    # Statuses: submitted, under_review, in_progress, resolved, rejected
    
    # File attachment
    file_path = db.Column(db.String(500), nullable=True)
    file_type = db.Column(db.String(10), nullable=True)  # pdf, mp3, wav, ogg
    
    # User references
    submitted_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    status_logs = db.relationship('StatusLog', backref='petition', lazy=True,
                                   cascade='all, delete-orphan')
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_petitions')

    def to_dict(self):
        """Serialize petition to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'ai_category': self.ai_category,
            'ai_confidence': round(self.ai_confidence, 2) if self.ai_confidence else None,
            'priority': self.priority,
            'priority_score': round(self.priority_score, 2) if self.priority_score else 0,
            'status': self.status,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'submitted_by': self.submitted_by,
            'assigned_to': self.assigned_to,
            'submitter_name': self.submitter.name if self.submitter else None,
            'assignee_name': self.assignee.name if self.assignee else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'status_history': [log.to_dict() for log in self.status_logs],
        }
