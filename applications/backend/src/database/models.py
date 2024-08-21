from datetime import datetime
from sqlalchemy import Column, Date, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    country = Column(String)
    company = Column(String)
    gender = Column(String)
    position = Column(String)
    hashed_password = Column(String)


class MoodLog(Base):
    __tablename__ = "mood_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.now)
    mood = Column(String)
    note = Column(String)
    date = Column(Date, default=datetime.now)
    day_of_week = Column(Integer, default=datetime.now().weekday)
    time_of_day = Column(String, default=datetime.now().strftime("%I:%M %p"))
    user = relationship("User")


class SurveySchedule(Base):
    __tablename__ = "survey_schedules"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    day_of_week = Column(Integer)
    time_of_day = Column(String)
    user = relationship("User")
