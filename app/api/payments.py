from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_store
from app.core.config import settings
from app.core.plans import PLANS
from app.core.zibal_service import request_payment, get_payment_url, verify_payment
from app.models.store import Store, Payment, PaymentStatus
from app.schemas.store import PlanOut, PaymentRequestCreate, PaymentRequestOut

router = APIRouter(tags=["payments"])


@router.get("/plans", response_model=list[PlanOut])
def list_plans():
    return [
        PlanOut(
            id=plan_id,
            name=plan["name"],
            price_toman=plan["price_toman"],
            duration_days=plan["duration_days"],
            features=plan["features"],
        )
        for plan_id, plan in PLANS.items()
    ]


@router.post("/payments/request", response_model=PaymentRequestOut)
def create_payment_request(
    data: PaymentRequestCreate,
    current_store: Store = Depends(get_current_store),
    db: Session = Depends(get_db),
):
    plan = PLANS.get(data.plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="پلن پیدا نشد")

    amount_rial = plan["price_toman"] * 10

    payment = Payment(
        store_id=current_store.id,
        plan_name=data.plan_id,
        amount=amount_rial,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    callback_url = f"{settings.backend_public_url or 'http://127.0.0.1:8000'}/payments/callback?payment_id={payment.id}"

    zibal_result = request_payment(
        amount=amount_rial,
        callback_url=callback_url,
        description=f"اشتراک {plan['name']} - Omini",
    )

    if zibal_result.get("result") != 100:
        payment.status = PaymentStatus.failed
        db.commit()
        raise HTTPException(status_code=400, detail="خطا در ایجاد درخواست پرداخت")

    track_id = str(zibal_result.get("trackId"))
    payment.track_id = track_id
    db.commit()

    return PaymentRequestOut(payment_url=get_payment_url(track_id))


@router.get("/payments/callback")
def payment_callback(payment_id: int, trackId: str, success: str, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()

    frontend_base = settings.frontend_url

    if not payment:
        return RedirectResponse(f"{frontend_base}/dashboard/subscription?status=error")

    if success != "1":
        payment.status = PaymentStatus.failed
        db.commit()
        return RedirectResponse(f"{frontend_base}/dashboard/subscription?status=failed")

    verify_result = verify_payment(track_id=payment.track_id)

    if verify_result.get("result") not in (100, 201):
        payment.status = PaymentStatus.failed
        db.commit()
        return RedirectResponse(f"{frontend_base}/dashboard/subscription?status=failed")

    payment.status = PaymentStatus.success
    db.commit()

    store = db.query(Store).filter(Store.id == payment.store_id).first()
    plan = PLANS.get(payment.plan_name)

    if store and plan:
        store.subscription_plan = payment.plan_name
        store.is_subscribed = True
        store.subscription_expires_at = datetime.utcnow() + timedelta(days=plan["duration_days"])
        db.commit()

    return RedirectResponse(f"{frontend_base}/dashboard/subscription?status=success")