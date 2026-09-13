from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_store
from app.models.store import Store, Message
from app.schemas.store import MessageOut

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/", response_model=list[MessageOut])
def list_messages(
    current_store: Store = Depends(get_current_store),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(Message)
        .filter(Message.store_id == current_store.id)
        .order_by(Message.created_at.desc())
        .all()
    )
    return messages


