from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, field_validator


# Pydantic models
class UserIn(BaseModel):
    name: str
    email: str
    country: str
    company: str
    gender: str
    position: str
    password: str


class UserOut(UserIn):
    hashed_password: str
    password: Optional[str] = ""

    class Config:
        from_attributes = True


# Additional Pydantic models
class MoodLogIn(BaseModel):
    mood: str
    note: Optional[str]
    day_of_week: int
    time_of_day: str

    # @field_validator("day_of_week")
    # def validate_day_of_week(cls, v):
    #     if v < 1 or v > 7:
    #         raise ValueError("day_of_week must be between 1 and 7")
    #     return v


class SurveyScheduleIn(BaseModel):
    day_of_week: int
    time_of_day: str

    # @field_validator("day_of_week")
    # def validate_day_of_week(cls, v):
    #     if v < 1 or v > 7:
    #         raise ValueError("day_of_week must be between 1 and 7")
    #     return v

    # @field_validator("time_of_day")
    # def validate_time_of_day(cls, v):
    #     try:
    #         time_parts = list(map(int, v.split(":")))
    #         if len(time_parts) != 2 or not (
    #             0 <= time_parts[0] < 24 and 0 <= time_parts[1] < 60
    #         ):
    #             raise ValueError
    #     except Exception:
    #         raise ValueError(
    #             "time_of_day must be in the format HH:MM and within valid range"
    #         )
    #     return v


class MoodLogOut(MoodLogIn):
    id: int
    date: Optional[Any]

    class Config:
        from_attributes = True


class SurveyScheduleOut(SurveyScheduleIn):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class Login(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class IdIn(BaseModel):
    id: int


class TokenData(BaseModel):
    email: str = None


class TokenPayload(BaseModel):
    sub: str = None
    exp: int = None
