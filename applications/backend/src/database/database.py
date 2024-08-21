from typing import Any, List, Optional, Type, TypeVar
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import Session, sessionmaker

from ..database.models import Base, User, MoodLog, SurveySchedule
from ..schemes import MoodLogOut, SurveyScheduleOut, UserIn

SqlModelType = TypeVar("SqlModelType", bound=Base)
SqlModelClassType = TypeVar("SqlModelClassType", bound=Type[Base])


class Database:
    base = Base

    def __init__(
        self,
        username: str = "admin",
        password: str = "admin",
        host: str = "localhost",
        port: int = 3306,
        database_name: str = "moodit",
    ) -> None:
        self.username = username
        self.password = password
        self.host = host
        self.port = port
        self.database_name = database_name

        # create session engine
        self.engine = create_engine(
            URL.create(
                # "mysql",
                "postgresql+psycopg2",
                username=self.username,
                password=self.password,
                host=self.host,
                port=self.port,
                database=self.database_name,
            )
        )

        # create re-usable session
        # NOTE: autoflush is disabled following the FastAPI tutorial
        # https://fastapi.tiangolo.com/tutorial/sql-databases
        self.session_class = sessionmaker(
            self.engine,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )

        # create all tables
        self._create_all_tables()

    def _create_all_tables(self) -> None:
        # create all tables if they dont exists
        self.base.metadata.create_all(self.engine)
        # Run Alembic migrations
        # command.upgrade(self.alembic_cfg, "head")

    def _drop_all_tables(self) -> None:
        # drop all tables
        self.base.metadata.drop_all(self.engine)

    def _create_item(self, session: Session, item: SqlModelType) -> SqlModelType:
        session.add(item)
        session.commit()
        session.refresh(item)
        return item

    def _create_items(
        self, session: Session, items: List[SqlModelType]
    ) -> List[SqlModelType]:
        try:
            for item in items:
                session.add(item)
                session.commit()
                session.refresh(item)
            # Assuming you want to refresh all items in the list
            return items
        except Exception:
            session.rollback()
            raise

    def _update_item(self, session: Session, item: SqlModelType) -> SqlModelType:
        updated_item = session.merge(item)
        session.commit()
        return updated_item
    
    def _update_items(
        self, session: Session, items: List[SqlModelType]
    ) -> List[SqlModelType]:
        try:
            updates_items = []
            for item in items:
                updated_item = session.merge(item)
                updates_items.append(updated_item)
                session.commit()
            return updates_items
        except Exception:
            session.rollback()
            raise

    def _delete_item_by_match(
        self,
        session: Session,
        sql_model: SqlModelClassType,
        matching_column: str,
        matching_value: Any,
    ) -> int:
        row_count: int = (
            session.query(sql_model)
            .filter(getattr(sql_model, matching_column) == matching_value)
            .delete()
        )
        session.commit()
        return row_count

    def _get_item_by_match(
        self,
        session: Session,
        sql_model: SqlModelClassType,
        matching_column: str,
        matching_value: Any,
    ) -> Optional[SqlModelType]:
        sql_results: Optional[SqlModelType] = (
            session.query(sql_model)
            .filter(getattr(sql_model, matching_column) == matching_value)
            .first()
        )

        return sql_results

    def _get_items_by_match(
        self,
        session: Session,
        sql_model: SqlModelClassType,
        matching_column: str,
        matching_value: Any,
    ) -> List[SqlModelType]:
        sql_results: List[SqlModelType] = (
            session.query(sql_model)
            .filter(getattr(sql_model, matching_column) == matching_value)
            .all()
        )

        return sql_results

    # Authentication function
    def authenticate_user(self, session: Session, email: str, password: str) -> User:
        user = self._get_item_by_match(
            session=session,
            sql_model=User,
            matching_column="email",
            matching_value=email,
        )
        return user

    def create_user(
        self, session: Session, rest_document: UserIn, password: str
    ) -> User:
        sql_user = User(
            name=rest_document.name,
            email=rest_document.email,
            country=rest_document.country,
            company=rest_document.company,
            gender=rest_document.gender,
            position=rest_document.position,
            hashed_password=password,
        )
        return self._create_item(session=session, item=sql_user)

    def get_user_by_id(self, session: Session, user_id: str) -> User:
        return self._get_item_by_match(
            session=session,
            sql_model=User,
            matching_column="id",
            matching_value=user_id,
        )

    def get_user_by_email(self, session: Session, email: str) -> User:
        return self._get_item_by_match(
            session=session,
            sql_model=User,
            matching_column="email",
            matching_value=email,
        )

    def create_mood_log(self, session: Session, sql_model: MoodLog) -> MoodLog:
        return self._create_item(session=session, item=sql_model)

    def get_mood_logs(self, session: Session, user_id: int) -> Optional[List[MoodLog]]:
        return self._get_items_by_match(
            session=session,
            sql_model=MoodLog,
            matching_column="user_id",
            matching_value=user_id,
        )

    def update_mood_log(self, session: Session, rest_document: MoodLogOut) -> MoodLog:
        sql_model = MoodLog(**rest_document.model_dump())
        return self._update_item(session=session, item=sql_model)

    def delete_mood_logs(self, session: Session, log_id: int) -> int:
        return self._delete_item_by_match(
            session=session,
            sql_model=MoodLog,
            matching_column="id",
            matching_value=log_id,
        )

    def create_survey_schedule(
        self, session: Session, sql_model: List[SurveySchedule]
    ) -> List[SurveySchedule]:
        return self._create_items(session=session, items=sql_model)

    def get_survey_schedules(
        self, session: Session, user_id: int
    ) -> Optional[List[SurveySchedule]]:
        return self._get_items_by_match(
            session=session,
            sql_model=SurveySchedule,
            matching_column="user_id",
            matching_value=user_id,
        )

    def update_survey_schedule(
        self, session: Session, rest_document: SurveyScheduleOut
    ) -> SurveySchedule:
        sql_model = SurveySchedule(**rest_document.model_dump())
        return self._update_item(session=session, item=sql_model)

    def delete_survey_schedule(self, session: Session, schedule_id: int) -> int:
        return self._delete_item_by_match(
            session=session,
            sql_model=SurveySchedule,
            matching_column="id",
            matching_value=schedule_id,
        )
