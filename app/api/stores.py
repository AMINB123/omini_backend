from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt

from app.core.database import get_db
from app.api.deps import get_current_store
from app.core.telegram_service import set_telegram_webhook
from app.core.config import settings
from app.models.store import Store
from app.schemas.store import StoreCreate, StoreOut, TelegramTokenUpdate, BusinessInfoUpdate

router = APIRouter(prefix="/stores", tags=["stores"])


def to_store_out(store: Store) -> StoreOut:
    return StoreOut(
        id=store.id,
        name=store.name,
        email=store.email,
        is_subscribed=store.is_subscribed,
        created_at=store.created_at,
        telegram_connected=bool(store.telegram_bot_token),
        business_info=store.business_info,
        subscription_plan=store.subscription_plan,
        subscription_expires_at=store.subscription_expires_at,
    )


@router.post("/register", response_model=StoreOut)
def register_store(store_in: StoreCreate, db: Session = Depends(get_db)):
    existing = db.query(Store).filter(Store.email == store_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = bcrypt.hashpw(store_in.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    new_store = Store(
        name=store_in.name,
        email=store_in.email,
        hashed_password=hashed_password,
    )
    db.add(new_store)
    db.commit()
    db.refresh(new_store)
    return to_store_out(new_store)


@router.get("/me", response_model=StoreOut)
def read_current_store(current_store: Store = Depends(get_current_store)):
    return to_store_out(current_store)


@router.put("/me/telegram-token", response_model=StoreOut)
def update_telegram_token(
    token_data: TelegramTokenUpdate,
    current_store: Store = Depends(get_current_store),
    db: Session = Depends(get_db),
):
    current_store.telegram_bot_token = token_data.telegram_bot_token
    db.commit()
    db.refresh(current_store)

    if settings.backend_public_url:
        webhook_url = f"{settings.backend_public_url}/webhooks/telegram/{current_store.id}"
        set_telegram_webhook(token_data.telegram_bot_token, webhook_url)

    return to_store_out(current_store)


@router.put("/me/business-info", response_model=StoreOut)
def update_business_info(
    info_data: BusinessInfoUpdate,
    current_store: Store = Depends(get_current_store),
    db: Session = Depends(get_db),
):
    current_store.business_info = info_data.business_info
    db.commit()
    db.refresh(current_store)
    return to_store_out(current_store)