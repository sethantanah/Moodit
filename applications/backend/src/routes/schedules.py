from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from typing_extensions import Annotated

from src.config import Settings

from ..database.models import SurveySchedule, User

from ..database.database import Database
from ..dependencies import get_database, get_settings
from ..schemes import IdIn, SurveyScheduleIn, SurveyScheduleOut
from ..auth.oauth import reuseable_oauth, get_current_user

router = APIRouter(prefix="/schedules", tags=["schedules"])


# Survey scheduling endpoint
@router.post("/create/", summary="Creates a survey schedule")
def schedule_survey(
    survey_schedule: List[SurveyScheduleIn],
    db: Annotated[Database, Depends(get_database)],
    settings: Annotated[Settings, Depends(get_settings)],
    token: str = Depends(reuseable_oauth),
):
    try:
        with db.session_class() as session:
            user: User = get_current_user(token, db, settings)
            db_survey_schedules: List[SurveySchedule] = []

            for schedule in survey_schedule:
                db_survey_schedule = SurveySchedule(
                    user_id=user.id,
                    day_of_week=schedule.day_of_week,
                    time_of_day=schedule.time_of_day,
                )
                db_survey_schedules.append(db_survey_schedule)

            db.create_survey_schedule(session=session, sql_model=db_survey_schedules)

            return db_survey_schedule
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{e}")


@router.get("/all", response_model=Optional[List[SurveyScheduleOut]])
async def get_schedules(
    db: Annotated[Database, Depends(get_database)],
    settings: Annotated[Settings, Depends(get_settings)],
    token: str = Depends(reuseable_oauth),
) -> Optional[List[SurveySchedule]]:

    with db.session_class() as session:
        user: User = get_current_user(token, db, settings)
        try:
            sql_results = db.get_survey_schedules(session=session, user_id=user.id)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{e}")
        return sql_results


@router.post("/update", response_model=SurveyScheduleOut)
async def update_schedules(
    schedule: SurveyScheduleOut,
    db: Annotated[Database, Depends(get_database)],
    token: str = Depends(reuseable_oauth),
) -> SurveySchedule:

    with db.session_class() as session:
        try:
            sql_results = db.update_survey_schedule(
                session=session, rest_document=schedule
            )
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{e}")
        return sql_results


@router.post("/delete")
async def delete_schedules(
    schedule_id: IdIn,
    db: Annotated[Database, Depends(get_database)],
    token: str = Depends(reuseable_oauth),
) -> int:

    with db.session_class() as session:
        try:
            sql_results = db.delete_survey_schedule(
                session=session, schedule_id=schedule_id.id
            )
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{e}")
        return sql_results
