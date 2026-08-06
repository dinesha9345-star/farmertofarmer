"""Farm2Home AI services powered by Emergent LLM Key + emergentintegrations."""
import os
import json
import re
from typing import AsyncGenerator, Optional
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

SYSTEM_CHATBOT = (
    "You are AgriBot, the friendly AI assistant for Farm2Home — a direct farmer-to-customer marketplace in India. "
    "You help both farmers and customers. For customers: help discover fresh organic produce, explain products, "
    "delivery, freshness, seasonality. For farmers: give advice on pricing, harvest timing, soil, weather, and "
    "market demand. Keep answers concise (2-4 short paragraphs), warm, practical, and India-focused. "
    "Use INR (₹) for prices and mention specific Indian regions/mandis where relevant. Never invent order data."
)

SYSTEM_PRICE = (
    "You are an agri-market analyst for India. Predict next-month price for the given crop based on typical "
    "seasonality, current-month demand patterns, and mandi trends. Respond ONLY as strict JSON with keys: "
    "currentPrice (number, INR per kg), predictedPriceNextMonth (number), demandTrend (string like 'High Surge (+15%)'), "
    "recommendation (short one-sentence recommendation), confidence (0-1 float). No prose, JSON only."
)

SYSTEM_RECOMMEND = (
    "You are a personal shopping assistant for Farm2Home. Given a customer's recent orders and available products, "
    "recommend 4 products they would love next. Respond ONLY as strict JSON with keys: "
    "message (2-sentence friendly intro), picks (array of {productId, reason}). No prose, JSON only. "
    "Only pick from the provided product list. Reasons should be 1 short sentence."
)


def _new_chat(session_id: str, system_message: str) -> LlmChat:
    return LlmChat(
        api_key=EMERGENT_KEY,
        session_id=session_id,
        system_message=system_message,
    ).with_model("openai", "gpt-5.4")


async def stream_chat(session_id: str, message: str, context: str = "general") -> AsyncGenerator[str, None]:
    system = SYSTEM_CHATBOT
    if context == "farmer_support":
        system += " Prioritize farmer-facing advice, wholesale prices, agronomy and government schemes."
    chat = _new_chat(session_id, system)
    async for ev in chat.stream_message(UserMessage(text=message)):
        if isinstance(ev, TextDelta):
            yield ev.content
        elif isinstance(ev, StreamDone):
            break


def _extract_json(text: str):
    # first strip triple-backtick fences if any
    text = text.strip()
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        raise ValueError("No JSON in response")
    return json.loads(m.group(0))


async def price_predict(crop: str, location: str = "", current_price: Optional[float] = None):
    session_id = f"pp-{crop.lower().replace(' ', '-')}"
    chat = _new_chat(session_id, SYSTEM_PRICE)
    prompt = f"Crop: {crop}. Region: {location or 'India (general)'}. "
    if current_price:
        prompt += f"Current mandi price approx ₹{current_price}/kg. "
    prompt += "Return JSON with currentPrice, predictedPriceNextMonth, demandTrend, recommendation, confidence."
    full = ""
    async for ev in chat.stream_message(UserMessage(text=prompt)):
        if isinstance(ev, TextDelta):
            full += ev.content
        elif isinstance(ev, StreamDone):
            break
    try:
        data = _extract_json(full)
    except Exception:
        # fallback deterministic estimate
        cp = current_price or 100
        data = {
            "currentPrice": cp,
            "predictedPriceNextMonth": round(cp * 1.08, 2),
            "demandTrend": "Steady (+8%)",
            "recommendation": "Monitor mandi rates weekly and hold stock for 7-10 days.",
            "confidence": 0.55,
        }
    data["crop"] = crop
    return data


async def product_recommendations(user_name: str, preferences: str, past_orders: list, products: list):
    session_id = f"rec-{user_name or 'anon'}"
    chat = _new_chat(session_id, SYSTEM_RECOMMEND)
    order_summary = []
    for o in past_orders[-5:]:
        for it in o.get("items", []):
            order_summary.append(it.get("name"))
    prompt = (
        f"Customer name: {user_name or 'Guest'}. Preferences: {preferences or 'organic, fresh'}. "
        f"Past order items: {order_summary or 'none'}. "
        f"Available products (id | name | category | organic | region | ₹): "
        + " ; ".join(f"{p['id']} | {p['name']} | {p['category']} | {'organic' if p.get('isOrganic') else 'conv'} | {p.get('location','')} | ₹{p.get('price')}" for p in products[:30])
        + ". Pick 4 productIds with reasons. Return JSON only."
    )
    full = ""
    async for ev in chat.stream_message(UserMessage(text=prompt)):
        if isinstance(ev, TextDelta):
            full += ev.content
        elif isinstance(ev, StreamDone):
            break
    try:
        data = _extract_json(full)
    except Exception:
        # fallback: first 4 organic products
        organic = [p for p in products if p.get("isOrganic")][:4]
        data = {
            "message": "Here are some fresh organic picks curated for you.",
            "picks": [{"productId": p["id"], "reason": f"Popular {p['category'].lower()} pick."} for p in organic],
        }
    # attach full product info
    ids = [pk["productId"] for pk in data.get("picks", [])]
    prod_by_id = {p["id"]: p for p in products}
    enriched = []
    for pk in data.get("picks", []):
        p = prod_by_id.get(pk.get("productId"))
        if p:
            enriched.append({"product": p, "reason": pk.get("reason", "")})
    data["picks"] = enriched
    return data
