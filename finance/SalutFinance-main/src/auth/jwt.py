import os
from datetime import timedelta, datetime

from fastapi import HTTPException, status
from jose import JWTError, jwt

from src.configurations.settings import settings
from src.schemas import TokenData


credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def decode_access_token(token: str):
    try:
        payload = jwt.decode(str(token), settings.secret_key, algorithms=[settings.algorithm])
        sub: int = payload.get("sub")
        if sub is None:
            raise credentials_exception
        token_data = TokenData(id=int(sub))
    except JWTError as error:
        raise credentials_exception

    return token_data
