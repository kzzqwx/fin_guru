from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from .base import BaseModel


class Transaction(BaseModel):
    __tablename__ = 'transactions'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    tag_id = Column(Integer, nullable=False)  # Will be constrained by relationship
    date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)