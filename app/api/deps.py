from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.store import Store

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_store(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Store:
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        store_id = payload.get("store_id")
        if store_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    store = db.query(Store).filter(Store.id == store_id).first()
    if store is None:
        raise credentials_exception

    return store