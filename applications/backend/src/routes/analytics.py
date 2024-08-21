from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from typing_extensions import Annotated

from src.config import Settings

from ..database.models import MoodLog, SurveySchedule, User

from ..database.database import Database
from ..dependencies import get_database, get_settings
from ..schemes import MoodLogIn, SurveyScheduleIn
from ..auth.oauth import reuseable_oauth, get_current_user

router = APIRouter(prefix="/mood-analytics", tags=["mood-analytics"])


# Mood analysis endpoint
@router.get("/analysis")
def analyze_mood(
    db: Annotated[Database, Depends(get_database)],
    settings: Annotated[Settings, Depends(get_settings)],
    token: str = Depends(reuseable_oauth),
):
    with db.session_class() as session:
        user = get_current_user(token, db, settings)
        mood_logs = session.query(MoodLog).filter(MoodLog.user_id == user.id).all()

        # Perform analysis
        mood_analysis = {
            "total_logs": len(mood_logs),
            "positive_moods": len([log for log in mood_logs if log.mood == "positive"]),
            "negative_moods": len([log for log in mood_logs if log.mood == "negative"]),
            "neutral_moods": len([log for log in mood_logs if log.mood == "neutral"]),
            "peak_positive_mood_time": None,  # Add logic for peak times
            "peak_negative_mood_time": None,  # Add logic for peak times
        }

        return mood_analysis
