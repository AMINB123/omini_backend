from datetime import datetime

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.ai_service import classify_message, analyze_conversation_for_sale
from app.core.telegram_service import send_telegram_message
from app.models.store import Message, Conversation, PlatformEnum, Store


@celery_app.task
def process_incoming_message(store_id: int, platform: str, sender_id: str, content: str):
    db = SessionLocal()
    try:
        store = db.query(Store).filter(Store.id == store_id).first()
        if not store:
            print(f"Store {store_id} not found")
            return {"status": "store_not_found"}

        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.store_id == store_id,
                Conversation.platform == PlatformEnum(platform),
                Conversation.sender_id == sender_id,
            )
            .first()
        )

        if not conversation:
            conversation = Conversation(
                store_id=store_id,
                platform=PlatformEnum(platform),
                sender_id=sender_id,
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        ai_result = classify_message(content, store.business_info)
        should_auto_reply = ai_result.get("should_auto_reply", False)
        suggested_reply = ai_result.get("suggested_reply", "")

        new_message = Message(
            store_id=store_id,
            conversation_id=conversation.id,
            platform=PlatformEnum(platform),
            sender_id=sender_id,
            content=content,
            category=ai_result.get("category"),
            is_urgent=ai_result.get("is_urgent", False),
            suggested_reply=suggested_reply,
        )
        db.add(new_message)

        conversation.last_message_at = datetime.utcnow()
        db.commit()
        db.refresh(new_message)

        print(f"Message saved with id={new_message.id}, category={new_message.category}, urgent={new_message.is_urgent}")

        if should_auto_reply and suggested_reply:
            if platform == "telegram" and store.telegram_bot_token:
                send_telegram_message(
                    bot_token=store.telegram_bot_token,
                    chat_id=sender_id,
                    text=suggested_reply,
                )
                new_message.auto_replied = True
                db.commit()
                print(f"Auto-reply sent to {sender_id}")

        all_messages = (
            db.query(Message)
            .filter(Message.conversation_id == conversation.id)
            .order_by(Message.created_at)
            .all()
        )
        history_text = "\n".join(f"مشتری: {m.content}" for m in all_messages)

        converted = analyze_conversation_for_sale(history_text)
        if converted != conversation.converted_to_sale:
            conversation.converted_to_sale = converted
            db.commit()
            print(f"Conversation {conversation.id} converted_to_sale updated to {converted}")

        return {"status": "saved", "message_id": new_message.id}
    finally:
        db.close()