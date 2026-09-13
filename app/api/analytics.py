from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_store
from app.models.store import Store, Conversation, Message
from app.schemas.store import AnalyticsSummary, PlatformCount, DailyCount

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    current_store: Store = Depends(get_current_store),
    db: Session = Depends(get_db),
):
    total_conversations = (
        db.query(Conversation)
        .filter(Conversation.store_id == current_store.id)
        .count()
    )

    converted_conversations = (
        db.query(Conversation)
        .filter(Conversation.store_id == current_store.id, Conversation.converted_to_sale.is_(True))
        .count()
    )

    conversion_rate = (
        (converted_conversations / total_conversations * 100) if total_conversations > 0 else 0.0
    )

    total_customer_messages = (
        db.query(Message)
        .filter(Message.store_id == current_store.id, Message.is_from_store.is_(False))
        .count()
    )

    auto_replied_messages = (
        db.query(Message)
        .filter(Message.store_id == current_store.id, Message.auto_replied.is_(True))
        .count()
    )

    auto_reply_rate = (
        (auto_replied_messages / total_customer_messages * 100) if total_customer_messages > 0 else 0.0
    )

    urgent_pending_count = (
        db.query(Message)
        .filter(
            Message.store_id == current_store.id,
            Message.is_urgent.is_(True),
            Message.is_from_store.is_(False),
            Message.auto_replied.is_(False),
        )
        .count()
    )

    platform_counts = (
        db.query(Message.platform, func.count(Message.id))
        .filter(Message.store_id == current_store.id, Message.is_from_store.is_(False))
        .group_by(Message.platform)
        .all()
    )
    messages_by_platform = [
        PlatformCount(platform=platform.value, count=count) for platform, count in platform_counts
    ]

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_counts = (
        db.query(func.date(Message.created_at), func.count(Message.id))
        .filter(
            Message.store_id == current_store.id,
            Message.is_from_store.is_(False),
            Message.created_at >= thirty_days_ago,
        )
        .group_by(func.date(Message.created_at))
        .order_by(func.date(Message.created_at))
        .all()
    )
    daily_message_counts = [
        DailyCount(date=str(date), count=count) for date, count in daily_counts
    ]

    return AnalyticsSummary(
        total_conversations=total_conversations,
        converted_conversations=converted_conversations,
        conversion_rate=round(conversion_rate, 1),
        auto_reply_rate=round(auto_reply_rate, 1),
        urgent_pending_count=urgent_pending_count,
        messages_by_platform=messages_by_platform,
        daily_message_counts=daily_message_counts,
    )