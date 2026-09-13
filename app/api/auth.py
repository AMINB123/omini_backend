from datetime import datetime, timedelta, timezone
import secrets
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import bcrypt

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token
from app.core.email_service import send_reset_password_email
from app.models.store import Store, RefreshToken, PasswordResetToken

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.email == form_data.username).first()

    if not store:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    password_matches = bcrypt.checkpw(
        form_data.password.encode("utf-8"),
        store.hashed_password.encode("utf-8"),
    )
    if not password_matches:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"store_id": store.id})
    refresh_token_value, refresh_expires_at = create_refresh_token()

    new_refresh_token = RefreshToken(
        store_id=store.id,
        token=refresh_token_value,
        expires_at=refresh_expires_at,
    )
    db.add(new_refresh_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token_value,
        "token_type": "bearer",
    }


@router.post("/refresh")
def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
    token_record = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()

    if not token_record:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if token_record.revoked:
        raise HTTPException(status_code=401, detail="Refresh token has been revoked")

    if token_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token has expired")

    new_access_token = create_access_token(data={"store_id": token_record.store_id})

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }



@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.email == email).first()

    if store:
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(minutes=30)

        reset_token = PasswordResetToken(
            store_id=store.id,
            token=token,
            expires_at=expires_at,
        )
        db.add(reset_token)
        db.commit()

        send_reset_password_email(store.email, token)

    return {"message": "اگر این ایمیل ثبت شده باشد، لینک بازیابی برایش ارسال می‌شود"}


@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    token_record = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token == token)
        .first()
    )

    if not token_record:
        raise HTTPException(status_code=400, detail="لینک بازیابی نامعتبر است")

    if token_record.used:
        raise HTTPException(status_code=400, detail="این لینک قبلاً استفاده شده است")

    if token_record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="این لینک منقضی شده است")

    store = db.query(Store).filter(Store.id == token_record.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="فروشگاه پیدا نشد")

    hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    store.hashed_password = hashed_password

    token_record.used = True
    db.commit()

    return {"message": "رمز عبور با موفقیت تغییر کرد"}