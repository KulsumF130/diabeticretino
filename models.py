from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to Predictions
    predictions = db.relationship('Prediction', backref='patient', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.email}>'

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    image = db.Column(db.String(255), nullable=False)  # Path to uploaded retina image
    heatmap = db.Column(db.String(255), nullable=True) # Path to Grad-CAM heatmap overlay
    prediction = db.Column(db.Integer, nullable=False)  # Class: 0, 1, 2, 3, or 4
    confidence = db.Column(db.Float, nullable=False)   # Confidence score (0 to 100)
    
    # Class probabilities for detailed display
    prob_0 = db.Column(db.Float, default=0.0)
    prob_1 = db.Column(db.Float, default=0.0)
    prob_2 = db.Column(db.Float, default=0.0)
    prob_3 = db.Column(db.Float, default=0.0)
    prob_4 = db.Column(db.Float, default=0.0)
    
    prediction_time = db.Column(db.Float, default=0.0)  # Time taken for prediction in seconds
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Prediction {self.id} for User {self.user_id}: Class {self.prediction}>'
