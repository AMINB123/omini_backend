from app.core.database import SessionLocal
from app.models.store import Message, Conversation

db = SessionLocal()

try:
    orphan_messages = (
        db.query(Message)
        .filter(Message.conversation_id.is_(None))
        .order_by(Message.created_at)
        .all()
    )

    print(f"Found {len(orphan_messages)} messages without a conversation.")

    conversation_cache = {}

    for message in orphan_messages:
        key = (message.store_id, message.platform, message.sender_id)

        if key not in conversation_cache:
            conversation = (
                db.query(Conversation)
                .filter(
                    Conversation.store_id == message.store_id,
                    Conversation.platform == message.platform,
                    Conversation.sender_id == message.sender_id,
                )
                .first()
            )

            if not conversation:
                conversation = Conversation(
                    store_id=message.store_id,
                    platform=message.platform,
                    sender_id=message.sender_id,
                    last_message_at=message.created_at,
                )
                db.add(conversation)
                db.commit()
                db.refresh(conversation)

            conversation_cache[key] = conversation

        conversation = conversation_cache[key]
        message.conversation_id = conversation.id

        if message.created_at > conversation.last_message_at:
            conversation.last_message_at = message.created_at

    db.commit()
    print(f"Linked messages into {len(conversation_cache)} conversations.")

finally:
    db.close()