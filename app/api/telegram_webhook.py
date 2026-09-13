from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.store import Store
from app.tasks.message_tasks import process_incoming_message

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/telegram/{store_id}")
async def telegram_webhook(store_id: int, request: Request, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    data = await request.json()

    message = data.get("message")
    if not message:
        return {"status": "ignored"}

    chat_id = str(message["chat"]["id"])
    text = message.get("text", "")

    process_incoming_message.delay(
        store_id=store.id,
        platform="telegram",
        sender_id=chat_id,
        content=text,
    )

    return {"status": "received"}