# Omini — Unified Inbox for Online Shops

#### Video Demo: <URL HERE>

#### Description:

Omini is a full-stack SaaS platform that lets an online shop manage all of its customer messages — from Telegram, WhatsApp, and Instagram — from a single dashboard, instead of switching between three separate apps all day. On top of unifying the inbox, an AI agent automatically classifies every incoming message, flags urgent ones, and answers simple questions on its own, strictly based on information the shop owner has provided about their business — never by guessing. When the AI is not confident enough to answer, the message is left for the shop owner to answer manually, directly from the same dashboard, and the reply is sent back out through whichever platform the customer originally used.

This repository contains the backend of the project. The frontend (Next.js dashboard) lives in a separate repository, linked at the bottom of this file.

## Why I built this

Small online shops in my country typically run their customer support across Instagram Direct, WhatsApp, and Telegram simultaneously, because that's where their customers already are. The owner ends up checking three different apps all day, answering the same kinds of questions over and over (working hours, shipping cost, return policy), and easily loses track of which conversations are still waiting for a reply. I wanted to build something that solves that specific, everyday problem: one inbox, one place to reply from, and an AI that handles the repetitive questions so the owner can focus on the ones that actually need a human.

## How it works

When a customer messages a shop's Telegram bot, Telegram forwards that message to a webhook endpoint on this backend. The endpoint immediately hands the message off to a Celery background task and returns a response right away, so the webhook never times out while the AI is thinking. That background task is where the real logic lives: it groups the message into a `Conversation` (based on the store, the platform, and the customer's ID), sends the message together with the shop's own business information to Google's Gemini model, and asks it to classify the message (question, complaint, order, spam...), flag whether it's urgent, and decide whether it's confident enough to answer on its own. The prompt explicitly forbids the model from guessing anything that isn't written in the shop's own business info, so it never invents a shipping time or a return policy that doesn't exist. If it can answer, it sends the reply straight back to the customer on Telegram. If not, the conversation just sits in the dashboard, waiting for the shop owner. After every new message, the same AI service re-reads the whole conversation history and decides whether it ended in a sale, which feeds directly into the analytics page.

Authentication uses short-lived JWT access tokens paired with longer-lived refresh tokens stored in the database, so a shop owner doesn't get logged out every 30 minutes but a stolen token still expires quickly. Passwords are hashed with bcrypt. A "forgot password" flow sends a real, single-use, time-limited reset link by email through SMTP.

Subscriptions are handled through Zibal, an Iranian payment gateway, using their real request/verify API flow: the backend creates a pending payment record, gets a payment URL from Zibal, and once the customer's browser is redirected back to a callback endpoint, the backend verifies the transaction server-side before activating the subscription — the frontend never decides on its own that a payment succeeded.

## Project structure

- `app/main.py` — creates the FastAPI app, sets up CORS, and wires up every router.
- `app/core/` — configuration (`config.py`), the SQLAlchemy engine (`database.py`), JWT helpers (`security.py`), and the outbound integrations: `telegram_service.py` (sending messages and registering webhooks), `ai_service.py` (the two Gemini prompts — message classification and conversation-level sale detection), `email_service.py` (password reset emails over SMTP), and `zibal_service.py` (payment gateway calls).
- `app/models/store.py` — every SQLAlchemy model: `Store`, `Message`, `Conversation`, `RefreshToken`, `PasswordResetToken`, and `Payment`.
- `app/schemas/store.py` — Pydantic schemas that define exactly what each endpoint accepts and returns, kept deliberately separate from the database models (for example, a password hash is never accidentally serialized back to the client).
- `app/api/` — one router file per feature area: `auth.py` (login, refresh, password reset), `stores.py` (registration, profile, connecting a Telegram bot), `telegram_webhook.py` (the public endpoint Telegram calls), `conversations.py` (listing conversations and sending manual replies), `analytics.py` (the metrics behind the analytics dashboard), and `payments.py` (plans and the Zibal payment flow).
- `app/tasks/message_tasks.py` — the Celery task that does the actual AI processing described above, kept out of the request/response cycle on purpose.
- `alembic/` — every database migration, so the schema's history is fully tracked instead of being guessed from the models alone.

## A design decision I want to call out

Early on, every incoming message was classified and replied to individually, with no memory of the rest of the conversation. That meant a customer saying "okay, order it" in a follow-up message couldn't be understood as a purchase, because the system had no concept of a "conversation" at all — just a flat list of messages. I went back and introduced the `Conversation` model specifically so the AI could look at an entire exchange instead of one message at a time, which is also what made automatic sale-conversion detection for the analytics page possible in the first place.

## Honest use of AI tools

I built this project with substantial help from Claude (Anthropic), used as a hands-on teaching assistant rather than an autocomplete tool: I described what I wanted, asked "why" at nearly every step, and typed, ran, and debugged every file myself in my own editor and terminal. I did not have prior professional backend experience before this project, and I'm citing this assistance explicitly and honestly, as required by CS50's academic honesty policy.

## Frontend repository

The Next.js dashboard (landing page, login/registration, message inbox, analytics charts, and subscription/payment UI) lives here: https://github.com/AMINB123/omini_frontend