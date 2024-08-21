from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing_extensions import Annotated

from ..database.models import User
from ..auth.oauth import (
    create_access_token,
    verify_password,
    get_hashed_password,
    get_current_user,
)

from ..database.database import Database
from ..dependencies import get_database
from ..schemes import Token, UserIn, UserOut, Login


router = APIRouter(prefix="/auth", tags=["auth"])


# User signup endpoint
@router.post("/signup", summary="Create new user", response_model=UserOut)
def signup(user: UserIn, database: Annotated[Database, Depends(get_database)]) -> User:
    with database.session_class() as session:
        db_user = database.get_user_by_email(session=session, email=user.email)

        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exist",
            )

        try:
            hashed_password = get_hashed_password(user.password)
            user = database.create_user(
                session=session, rest_document=user, password=hashed_password
            )

        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Could not create user: {str(e)}"
            )

        return user


@router.post(
    "/signin_api",
    summary="Create access and refresh tokens for user",
    response_model=Token,
)
async def login_api(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends(OAuth2PasswordRequestForm)],
    database: Annotated[Database, Depends(get_database)],
):
    try:
        with database.session_class() as session:
            user = database.authenticate_user(
                session, form_data.username, form_data.password
            )
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect email or password",
                )

            if not verify_password(form_data.password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect email or password",
                )

            return {
                "access_token": create_access_token(user.email),
                "token_type": "bearer",
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Incorrect email or password: ${e}",
        )


@router.post(
    "/signin",
    summary="Create access and refresh tokens for user",
    response_model=Token,
)
async def login(
    form_data: Login,
    database: Annotated[Database, Depends(get_database)],
):
    try:
        with database.session_class() as session:
            user = database.authenticate_user(
                session, form_data.email, form_data.password
            )
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect email or password",
                )

            if not verify_password(form_data.password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Incorrect email or password",
                )

            return {
                "access_token": create_access_token(user.email),
                "token_type": "bearer",
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Incorrect email or password: ${e}",
        )


# Get current user
@router.get(
    "/me", summary="Get details of currently logged in user", response_model=UserOut
)
async def get_me(user: Annotated[User, Depends(get_current_user)]) -> User:
    return user
