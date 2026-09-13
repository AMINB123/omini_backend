from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import stores, auth, telegram_webhook, messages, conversations, analytics, payments

app = FastAPI(title="Omini Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stores.router)
app.include_router(auth.router)
app.include_router(telegram_webhook.router)
app.include_router(messages.router)
app.include_router(conversations.router)
app.include_router(analytics.router)
app.include_router(payments.router)

@app.get("/")
def health_check():
    return {"status": "ok"}