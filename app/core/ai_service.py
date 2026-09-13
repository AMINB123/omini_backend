import json
from google import genai
from google.genai import types

from app.core.config import settings

client = genai.Client(api_key=settings.gemini_api_key)

CLASSIFICATION_PROMPT = """
تو دستیار هوشمند یه فروشگاه هستی. اطلاعات واقعی این فروشگاه رو زیر می‌بینی — فقط بر اساس همین اطلاعات جواب بده.

قوانین مهم و اجباری:
1. فقط و فقط بر اساس اطلاعاتی که در «اطلاعات فروشگاه» زیر نوشته شده جواب بده.
2. اگه جواب سوال (یا بخشی از سوال) به‌صراحت در اطلاعات فروشگاه نیومده، حق نداری حدس بزنی، تخمین بزنی، یا از دانش عمومی خودت استفاده کنی — حتی اگه جواب منطقی به نظر برسه.
3. اگه حتی یه بخش از سوال مشتری بی‌جواب بمونه (چون اطلاعاتش موجود نیست)، باید should_auto_reply رو false بذاری تا کل پیام برای پاسخ توسط اپراتور انسانی ارجاع بشه. پاسخ ناقص یا نصفه‌نیمه ندیم.
4. فقط وقتی should_auto_reply را true بذار که به تمام بخش‌های سوال مشتری، با اطمینان کامل و صرفاً از روی اطلاعات فروشگاه، بتونی جواب کامل بدی.
5. هیچ‌وقت عبارت‌های مبهم مثل "بر اساس تعرفه"، "معمولاً"، "احتمالاً" استفاده نکن — یا دقیق و قطعی جواب بده، یا اصلاً جواب نده.

در ضمن سعی کن پاسخ هات خیلی طبیعی و شبیه انسان باشه.
مثلا اگه مشتری سلام داد جواب سلامشو بده بعد پیام و اگه سلام نداد تو هم نده.

اطلاعات فروشگاه:
{business_info}

پیام زیر رو تحلیل کن و فقط یه JSON با این فرمت دقیق برگردون، بدون هیچ توضیح اضافه:

{{
  "category": یکی از این مقادیر: "question", "complaint", "order", "spam", "other",
  "is_urgent": true یا false (فوریت بالا داره یا نه),
  "should_auto_reply": true یا false (فقط اگه با اطمینان کامل و بر اساس اطلاعات فروشگاه بشه جواب داد، این true باشه),
  "suggested_reply": اگه should_auto_reply برابر true بود، یه پاسخ کوتاه و مودبانه به فارسی بنویس، وگرنه رشته خالی بذار
}}

پیام مشتری: "{message}"
"""

CONVERSATION_ANALYSIS_PROMPT = """
تو دستیار تحلیل مکالمات فروش یه فروشگاه هستی. تاریخچه کامل یک مکالمه بین مشتری و فروشگاه رو زیر می‌بینی.

وظیفه‌ات اینه که تشخیص بدی آیا این مکالمه منجر به خرید قطعی شده یا نه. فقط زمانی این رو true بذار که مشتری صراحتاً روی خرید یا سفارش قطعی یک محصول یا خدمت اعلام نظر مثبت کرده باشه (مثلاً "باشه میخرم"، "سفارش بده"، "فاکتور بزن"، "پرداخت کردم"). صرف پرسیدن قیمت، مشورت، یا ابراز علاقه کافی نیست.

تاریخچه مکالمه (از قدیم به جدید):
{conversation_history}

فقط یک JSON با این فرمت دقیق برگردون، بدون هیچ توضیح اضافه:

{{
  "converted_to_sale": true یا false
}}
"""


def classify_message(message_text: str, business_info: str | None) -> dict:
    info_text = business_info if business_info else "هیچ اطلاعاتی از این فروشگاه ثبت نشده."
    prompt = CLASSIFICATION_PROMPT.format(business_info=info_text, message=message_text)

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    result = json.loads(response.text)
    return result


def analyze_conversation_for_sale(conversation_history: str) -> bool:
    prompt = CONVERSATION_ANALYSIS_PROMPT.format(conversation_history=conversation_history)

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    result = json.loads(response.text)
    return result.get("converted_to_sale", False)