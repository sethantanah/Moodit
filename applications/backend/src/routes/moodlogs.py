from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from typing_extensions import Annotated

from src.config import Settings

from ..database.models import MoodLog, User

from ..database.database import Database
from ..dependencies import get_database, get_settings
from ..schemes import MoodLogIn, MoodLogOut
from ..auth.oauth import reuseable_oauth, get_current_user

router = APIRouter(prefix="/moodlogs", tags=["moodlogs"])


# Mood logging endpoint
@router.post("/create")
def log_mood(
    mood_log: MoodLogIn,
    db: Annotated[Database, Depends(get_database)],
    settings: Annotated[Settings, Depends(get_settings)],
    token: str = Depends(reuseable_oauth),
):
    try:
        with db.session_class() as session:
            user: User = get_current_user(token, db, settings)
            db_mood_log = MoodLog(
                user_id=user.id,
                mood=mood_log.mood,
                day_of_week=mood_log.day_of_week,
                time_of_day=mood_log.time_of_day,
            )
            db.create_mood_log(session=session, sql_model=db_mood_log)
            return db_mood_log
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{e}")


@router.get("/all", response_model=Optional[List[MoodLogOut]])
async def get_moodlogs(
    db: Annotated[Database, Depends(get_database)],
    settings: Annotated[Settings, Depends(get_settings)],
    token: str = Depends(reuseable_oauth),
) -> Optional[List[MoodLog]]:

    with db.session_class() as session:
        user: User = get_current_user(token, db, settings)
        try:
            sql_results = db.get_mood_logs(session=session, user_id=user.id)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{e}")
        return sql_results


@router.post("/update", response_model=MoodLogOut)
async def update_mood_log(
    moodlog: MoodLogOut,
    db: Annotated[Database, Depends(get_database)],
    token: str = Depends(reuseable_oauth),
) -> MoodLog:

    with db.session_class() as session:
        try:
            sql_results = db.update_mood_log(
                session=session, rest_document=moodlog
            )
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{e}")
        return sql_results


@router.post("/delete")
async def delete_mood_log(
    log_id: int,
    db: Annotated[Database, Depends(get_database)],
    token: str = Depends(reuseable_oauth),
) -> int:

    with db.session_class() as session:
        try:
            sql_results = db.delete_mood_logs(
                session=session, log_id=log_id
            )
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{e}")
        return sql_results
