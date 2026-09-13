from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.api.deps import get_current_store
from app.core.telegram_service import send_telegram_message
from app.models.store import Store, Conversation, Message
from app.schemas.store import ConversationOut, ReplyCreate

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("/", response_model=list[ConversationOut])
def list_conversations(
    current_store: Store = Depends(get_current_store),
    db: Session = Depends(get_db),
):
    conversations = (
        db.query(Conversation)
        .options(joinedload(Conversation.messages))
        .filter(Conversation.store_id == current_store.id)
        .order_by(Conversation.last_message_at.desc())
        .all()
    )
    return conversations


@router.put("/{conversation_id}/toggle-converted", response_model=ConversationOut)
def toggle_conversation_converted(
    conversation_id: int,
    current_store: Store = Depends(get_current_store),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .options(joinedload(Conversation.messages))
        .filter(Conversation.id == conversation_id, Conversation.store_id == current_store.id)
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="مکالمه پیدا نشد")

    conversation.converted_to_sale = not conversation.converted_to_sale
    db.commit()
    db.refresh(conversation)
    return conversation






@router.post("/{conversation_id}/reply", response_model=ConversationOut)
def send_reply(
    conversation_id: int,
    reply_data: ReplyCreate,
    current_store: Store = Depends(get_current_store),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.store_id == current_store.id)
        .first()
    )

    if not conversation:
        raise HTTPException(status_code=404, detail="مکالمه پیدا نشد")

    if conversation.platform.value == "telegram":
        if not current_store.telegram_bot_token:
            raise HTTPException(status_code=400, detail="بات تلگرام این فروشگاه وصل نیست")
        send_telegram_message(
            bot_token=current_store.telegram_bot_token,
            chat_id=conversation.sender_id,
            text=reply_data.content,
        )
    else:
        raise HTTPException(status_code=400, detail="ارسال پاسخ برای این پلتفرم هنوز پشتیبانی نمی‌شود")

    reply_message = Message(
        store_id=current_store.id,
        conversation_id=conversation.id,
        platform=conversation.platform,
        sender_id=conversation.sender_id,
        content=reply_data.content,
        is_from_store=True,
    )
    db.add(reply_message)
    db.commit()

    db.refresh(conversation)
    return conversation