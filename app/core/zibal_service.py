import httpx

from app.core.config import settings

ZIBAL_REQUEST_URL = "https://gateway.zibal.ir/v1/request"
ZIBAL_VERIFY_URL = "https://gateway.zibal.ir/v1/verify"
ZIBAL_START_URL = "https://gateway.zibal.ir/start"


def request_payment(amount: int, callback_url: str, description: str) -> dict:
    payload = {
        "merchant": settings.zibal_merchant_id,
        "amount": amount,
        "callbackUrl": callback_url,
        "description": description,
    }
    response = httpx.post(ZIBAL_REQUEST_URL, json=payload)
    return response.json()


def get_payment_url(track_id: str) -> str:
    return f"{ZIBAL_START_URL}/{track_id}"


def verify_payment(track_id: str) -> dict:
    payload = {
        "merchant": settings.zibal_merchant_id,
        "trackId": track_id,
    }
    response = httpx.post(ZIBAL_VERIFY_URL, json=payload)
    return response.json()