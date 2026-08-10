from datetime import datetime, timedelta, timezone

from app import db

TZ = timezone(timedelta(hours=-4))


class UserSessionModel(db.Model):
    __tablename__ = 'user_sessions'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'master.usuario.id'), nullable=False)
    jti = db.Column(db.String(64), unique=True, nullable=False)
    token_hash = db.Column(db.String(128))
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(TZ), nullable=False)
    last_seen_at = db.Column(db.DateTime, default=lambda: datetime.now(
        TZ), onupdate=lambda: datetime.now(TZ).strftime('%Y-%m-%d %H:%M:%S'), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    revoked_at = db.Column(db.DateTime)
    revoke_reason = db.Column(db.String(100))

    def __init__(self, user_id, jti, token_hash, ip_address=None, user_agent=None,
                 expires_at=None):
        self.user_id = user_id
        self.jti = jti
        self.token_hash = token_hash
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.created_at = datetime.now(TZ).strftime('%Y-%m-%d %H:%M:%S')
        self.last_seen_at = datetime.now(TZ).strftime('%Y-%m-%d %H:%M:%S')
        self.expires_at = expires_at.strftime('%Y-%m-%d %H:%M:%S')

    def save(self):
        db.session.add(self)
        db.session.commit()

    def revoke(self, reason=None):
        self.revoked_at = datetime.now(TZ).strftime('%Y-%m-%d %H:%M:%S')
        self.revoke_reason = reason
        db.session.commit()
