"""
User Model
Represents system users — citizens who submit petitions and admins who manage them.
"""
from datetime import datetime, timezone
from app import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=True) # Will be mandatory after migration
    role = db.Column(db.String(20), default='citizen')  # citizen, admin, officer
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    petitions = db.relationship('Petition', backref='submitter', 
                                 foreign_keys='Petition.submitted_by', lazy=True)

    def set_password(self, password):
        """Hash and set the user's password."""
        import bcrypt
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        """Check if the provided password matches the hash."""
        if not self.password_hash:
            return False
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        """Serialize user to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
