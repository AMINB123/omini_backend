from datetime import datetime
from pydantic import BaseModel, EmailStr


class StoreCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class StoreOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_subscribed: bool
    created_at: datetime
    telegram_connected: bool = False
    business_info: str | None = None
    subscription_plan: str | None = None
    subscription_expires_at: datetime | None = None

    class Config:
        from_attributes = True

class TelegramTokenUpdate(BaseModel):
    telegram_bot_token: str      



class MessageOut(BaseModel):
    id: int
    platform: str
    sender_id: str
    content: str
    category: str | None
    is_urgent: bool
    auto_replied: bool
    is_from_store: bool
    created_at: datetime

    class Config:
        from_attributes = True



class ConversationOut(BaseModel):
    id: int
    platform: str
    sender_id: str
    converted_to_sale: bool
    last_message_at: datetime
    messages: list[MessageOut]

    class Config:
        from_attributes = True




class BusinessInfoUpdate(BaseModel):
    business_info: str


class ReplyCreate(BaseModel):
    content: str


class PlatformCount(BaseModel):
    platform: str
    count: int


class DailyCount(BaseModel):
    date: str
    count: int


class AnalyticsSummary(BaseModel):
    total_conversations: int
    converted_conversations: int
    conversion_rate: float
    auto_reply_rate: float
    urgent_pending_count: int
    messages_by_platform: list[PlatformCount]
    daily_message_counts: list[DailyCount]


class PlanOut(BaseModel):
    id: str
    name: str
    price_toman: int
    duration_days: int
    features: list[str]


class PaymentRequestCreate(BaseModel):
    plan_id: str


class PaymentRequestOut(BaseModel):
    payment_url: str    


              