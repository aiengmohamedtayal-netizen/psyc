import os
import json
import logging
import asyncio
import time
import re
from typing import Optional, Tuple, List, Dict, Any, AsyncGenerator
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("stress_ai.llm_service")

LLM_API_KEY = os.getenv("LLM_API_KEY", "").strip()
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://backend.sovereigneg.com/v1").rstrip("/")
LLM_MODEL = os.getenv("LLM_MODEL", "deepseek-v4-flash").strip()
USE_LLM_ENHANCEMENT = os.getenv("USE_LLM_ENHANCEMENT", "true").lower() in ["true", "1", "yes"]

MAX_HISTORY_TURNS = 8

# ═══════════════════════════════════════════════════════════
# 1. CLINICAL SAFETY & CRISIS INTERVENTION GUARDRAILS
# ═══════════════════════════════════════════════════════════
CRISIS_PATTERNS = [
    r"\b(suicide|kill\s+myself|end\s+my\s+life|want\s+to\s+die|self\s*harm|cut\s+myself)\b",
    r"(عايز\s*اموت|عايز\s*انتحر|انتحار|اذي\s*نفسي|انهي\s*حياتي|مش\s*عايز\s*اعيش|بفكر\s*في\s*الموت)",
]

PRESCRIPTION_PATTERNS = [
    r"\b\d+(\.\d+)?\s*(mg|ملجم|جرام|ملغ|قرص|أقراص|كبسولة|كبسولات)\b",
    r"\b(xanax|prozac|zoloft|lexapro|valium|klonopin|ativan|effexor|cymbalta|سيرترالين|زاناكس|بروزاك|لوسترال|فاليوم|ريفوتريل|بنزوديازيبين)\b",
]

CRISIS_RESPONSE_AR = (
    "أنا سامعك وحاسس بألمك، وحياتك غالية ومهمة جداً. 🤍\n\n"
    "من فضلك، متكونش لوحدك دلوقتي. في ناس متخصصة ومستعدة تسمعك وتساعدك مجاناً وفي سرية تامة:\n"
    "• خط الدعم النفسي والطوارئ في مصر: 08008880700 أو 0220816831\n"
    "• الأمانة العامة للصحة النفسية وعلاج الإدمان: 16328\n"
    "• وإذا كنت خارج مصر، برجاء التواصل فوراً مع خط الطوارئ المحلي في بلدك أو التحدث لشخص تثق به الآن."
)

CRISIS_RESPONSE_EN = (
    "I hear how much pain you're in, and please know you don't have to carry this alone. Your life matters deeply. 🤍\n\n"
    "Please reach out to caring, trained professionals who are ready to support you 24/7, free and confidential:\n"
    "• US & Canada: Call or text 988 (Suicide & Crisis Lifeline)\n"
    "• UK: Call 111 (NHS) or 116 123 (Samaritans)\n"
    "• Egypt Mental Health Helpline: 08008880700 or 16328\n"
    "• International Resources: https://findahelpline.com/\n\n"
    "Please reach out to a trusted loved one or emergency services right now."
)


def detect_crisis(text: str) -> bool:
    lower_text = text.lower()
    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, lower_text):
            return True
    return False


def sanitize_prescription_content(text: str, lang: str = "ar") -> str:
    """Interception filter that redacts unauthorized drug dosages or chemical prescriptions."""
    sanitized = text
    found_violation = False
    for pat in PRESCRIPTION_PATTERNS:
        if re.search(pat, sanitized, re.IGNORECASE):
            found_violation = True
            sanitized = re.sub(pat, "[معلومات دوائية محجوبة / Med Info Redacted]", sanitized, flags=re.IGNORECASE)

    if found_violation:
        caveat = (
            "\n\n> ⚠️ **تنبيه أمان سريري:** تم حجب تفاصيل الأدوية الكيميائية أو الجرعات؛ لا يمكن للمساعد النفسي الذكي وصف أو تعديل الأدوية. يرجى مراجعة طبيب نفسي مرخص."
            if lang == "ar"
            else "\n\n> ⚠️ **Clinical Safety Warning:** Pharmaceutical drug dosages or prescriptions have been redacted. The AI companion is strictly non-prescriptive. Please consult a licensed psychiatrist."
        )
        sanitized += caveat
    return sanitized


# ═══════════════════════════════════════════════════════════
# 2. PRODUCTION LLM SERVICE (CBT + PSYCHIATRY REFERENCE)
# ═══════════════════════════════════════════════════════════
class ProductionLLMService:
    def __init__(
        self,
        api_key: str = LLM_API_KEY,
        base_url: str = LLM_BASE_URL,
        model: str = LLM_MODEL,
        enabled: bool = USE_LLM_ENHANCEMENT,
    ):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
        self.enabled = enabled and bool(api_key)
        self.endpoint = f"{self.base_url}/chat/completions"

        self._limits = httpx.Limits(max_keepalive_connections=20, max_connections=50)
        self._timeout = httpx.Timeout(connect=5.0, read=20.0, write=5.0, pool=5.0)

    def _build_system_prompt(
        self,
        retrieved_answer: str,
        topic: Optional[str],
        lang: str,
        clinical_ref: Optional[Dict[str, Any]] = None,
    ) -> str:
        topic_context = topic or "general mental wellbeing"

        # Integrate authoritative psychiatric citation if available
        ref_text = ""
        if clinical_ref:
            source = clinical_ref.get("source", "PubMed / NIMH")
            title = clinical_ref.get("title", "Clinical Protocol")
            evidence = clinical_ref.get("evidence_summary", "")
            citation = clinical_ref.get("citation", "")
            if lang == "ar":
                ref_text = f"\n[المرجع الطبي السريري المعتمد: {source} - «{title}»: {evidence} ({citation})]\n"
            else:
                ref_text = f"\n[Authoritative Clinical Reference: {source} - '{title}': {evidence} ({citation})]\n"

        if lang == "ar":
            return (
                "أنت 'Stress AI Helper'، أخصائي ومرشد نفسي ذكي وداعم يدمج أحدث بروتوكولات الطب النفسي والعلاج المعرفي السلوكي (CBT) واليقظة الذهنية.\n"
                "مهمتك: تقديم دعم نفسي راقٍ، إنساني، دافئ، عملي، ومستند إلى المراجع الطبية المعتمدة للمستخدم.\n\n"
                f"{ref_text}"
                "إرشادات الصياغة والأسلوب:\n"
                "1. اللهجة والأسلوب: تحدث بلهجة عربية دافئة ومطمئنة تجمع بين الفصحى البسيطة والعامية المصرية الراقية المفهومة للجميع. لا تكن جافاً أو رسمياً كأوراق الأبحاث.\n"
                "2. النواة الإرشادية المعتمدة: تم استخراج هذه النصيحة من قاعدة بياناتنا النفسية المعتمدة:\n"
                f"«{retrieved_answer}»\n"
                "3. البناء التوليدي: ادمج المرجع الطبي السريري والنصيحة أعلاه في رد متكامل، وقدم 1-3 خطوات عملية سهلة ومطمئنة.\n"
                f"4. التصنيف السريري للحالة: {topic_context}.\n"
                "5. الاختصار والوضوح: اجعل الرد مركّزاً ومريحاً للعين (بين 2 إلى 4 جمل أساسية، أو نقاط مرتبة).\n"
                "6. مراعاة سياق المحادثة: إذا كان هناك حوار سابق، ابْنِ على ما ذكره المستخدم وتابع معه بسلاسة.\n"
                "7. الحدود الطبية السريرية الصارمة (Strict Clinical Boundaries): يمنع منعاً باتاً وصف أي أسماء أدوية كيميائية أو جرعات دوائية أو تشخيص أمراض نفسية سريرية كبرى كطبيب بديل. ركز حصرياً على التثقيف النفسي (Psychoeducation) وتكنيكات CBT والتأريض الحسي، مع التوجيه لمراجعة طبيب مرخص إذا لزم الأمر."
            )
        else:
            return (
                "You are 'Stress AI Helper', an empathetic mental health assistant and stress coach grounded in psychiatric evidence, Cognitive Behavioral Therapy (CBT), and compassionate mindfulness.\n"
                "Your objective: Deliver warm, non-judgmental, evidence-informed, and actionable guidance.\n\n"
                f"{ref_text}"
                "Guidelines:\n"
                f"1. Verified Knowledge Core: Our clinical knowledge base retrieved this expert guidance for topic '{topic_context}':\n"
                f"«{retrieved_answer}»\n"
                "2. Synthesis: Ground your response in the clinical reference and retrieved guidance. Rephrase it into an organic, compassionate, and highly practical answer.\n"
                "3. Structure: Keep it accessible and easy to digest (2-4 clear sentences or bullet points with small, doable micro-actions).\n"
                "4. Tone: Emotionally validating, reassuring, and conversational. Never robotic or detached.\n"
                "5. Context Continuity: Naturally maintain continuity with previous turns in the conversation.\n"
                "6. Strict Clinical Boundaries: NEVER prescribe pharmaceutical drug names, dosages, or issue definitive clinical diagnostic labels. Confine your assistance strictly to psychoeducation, CBT restructuring, and grounding techniques."
            )

    def _prepare_messages(
        self,
        user_input: str,
        system_prompt: str,
        history: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, str]]:
        messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]

        if history:
            recent_history = history[-MAX_HISTORY_TURNS:]
            for msg in recent_history:
                role = "assistant" if msg.get("role") in ["bot", "assistant"] else "user"
                content = str(msg.get("content", "")).strip()
                if content:
                    messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_input})
        return messages

    async def _execute_with_retry(self, client: httpx.AsyncClient, payload: Dict[str, Any], max_retries: int = 2):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        for attempt in range(max_retries + 1):
            try:
                response = await client.post(self.endpoint, headers=headers, json=payload)
                if response.status_code == 200:
                    return response
                elif response.status_code in [429, 500, 502, 503, 504] and attempt < max_retries:
                    wait_time = (2 ** attempt) * 0.5
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    return response
            except (httpx.ConnectError, httpx.TimeoutException) as err:
                if attempt < max_retries:
                    wait_time = (2 ** attempt) * 0.5
                    await asyncio.sleep(wait_time)
                    continue
                raise err

        return None

    async def enhance_response(
        self,
        user_input: str,
        retrieved_answer: str,
        topic: Optional[str] = None,
        confidence: float = 0.0,
        lang: str = "ar",
        history: Optional[List[Dict[str, Any]]] = None,
        clinical_ref: Optional[Dict[str, Any]] = None,
    ) -> Tuple[str, bool]:
        """Non-streaming inference with safety guardrails and clinical grounding."""
        if detect_crisis(user_input):
            return (CRISIS_RESPONSE_AR if lang == "ar" else CRISIS_RESPONSE_EN), False

        if not self.enabled or not self.api_key:
            return retrieved_answer, False

        system_prompt = self._build_system_prompt(retrieved_answer, topic, lang, clinical_ref)
        messages = self._prepare_messages(user_input, system_prompt, history)

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.65,
            "max_tokens": 450,
            "top_p": 0.9,
        }

        try:
            async with httpx.AsyncClient(timeout=self._timeout, limits=self._limits) as client:
                response = await self._execute_with_retry(client, payload)
                if response and response.status_code == 200:
                    data = response.json()
                    enhanced = data["choices"][0]["message"]["content"].strip()
                    if enhanced:
                        sanitized = sanitize_prescription_content(enhanced, lang)
                        return sanitized, True
        except Exception as exc:
            logger.warning(f"Production LLM fallback triggered: {exc}")

        return retrieved_answer, False

    async def stream_enhance_response(
        self,
        user_input: str,
        retrieved_answer: str,
        topic: Optional[str] = None,
        confidence: float = 0.0,
        lang: str = "ar",
        history: Optional[List[Dict[str, Any]]] = None,
        clinical_ref: Optional[Dict[str, Any]] = None,
    ) -> AsyncGenerator[str, None]:
        """High-throughput SSE token streaming with clinical citation metadata and adaptive pacing."""
        if detect_crisis(user_input):
            crisis_msg = CRISIS_RESPONSE_AR if lang == "ar" else CRISIS_RESPONSE_EN
            for word in crisis_msg.split(" "):
                yield f"data: {json.dumps({'delta': word + ' '})}\n\n"
                await asyncio.sleep(0.015)
            meta = {
                "topic": "crisis_support",
                "confidence": 1.0,
                "enhanced_by_ai": False,
                "is_crisis": True,
                "clinical_reference": {
                    "source": "Ministry of Health & WHO",
                    "title": "24/7 Crisis Intervention",
                    "citation": "Egypt Mental Health Hotline 08008880700 & 16328",
                    "url": "https://findahelpline.com/",
                }
            }
            yield f"data: {json.dumps({'meta': meta})}\n\n"
            yield "data: [DONE]\n\n"
            return

        if not self.enabled or not self.api_key:
            words = retrieved_answer.split(" ")
            for w in words:
                yield f"data: {json.dumps({'delta': w + ' '})}\n\n"
                await asyncio.sleep(0.02)
            meta = {
                "topic": topic or "general",
                "confidence": confidence,
                "enhanced_by_ai": False,
                "clinical_reference": clinical_ref,
            }
            yield f"data: {json.dumps({'meta': meta})}\n\n"
            yield "data: [DONE]\n\n"
            return

        system_prompt = self._build_system_prompt(retrieved_answer, topic, lang, clinical_ref)
        messages = self._prepare_messages(user_input, system_prompt, history)

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.65,
            "max_tokens": 450,
            "top_p": 0.9,
            "stream": True,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=self._timeout, limits=self._limits) as client:
                async with client.stream("POST", self.endpoint, headers=headers, json=payload) as response:
                    if response.status_code == 200:
                        streamed_any = False
                        accumulated_text = ""
                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                raw_chunk = line[6:].strip()
                                if raw_chunk == "[DONE]":
                                    break
                                try:
                                    parsed = json.loads(raw_chunk)
                                    delta = parsed["choices"][0]["delta"].get("content", "")
                                    if delta:
                                        streamed_any = True
                                        accumulated_text += delta
                                        yield f"data: {json.dumps({'delta': delta})}\n\n"
                                        # Adaptive pacing for calm reading speed
                                        await asyncio.sleep(0.012)
                                except Exception:
                                    continue

                        # Post-generation clinical prescription filter
                        if streamed_any and accumulated_text:
                            for pat in PRESCRIPTION_PATTERNS:
                                if re.search(pat, accumulated_text, re.IGNORECASE):
                                    warning_append = (
                                        "\n\n> ⚠️ **تنبيه إرشادي سريري:** أي إشارات لجرعات أو أدوية كيميائية تخضع حصراً لتقييم الطبيب البشري ولا يجوز تناولها دون فحص سريري."
                                        if lang == "ar"
                                        else "\n\n> ⚠️ **Clinical Guidance:** Any pharmaceutical dosages or drug references require direct clinical evaluation by a licensed physician."
                                    )
                                    yield f"data: {json.dumps({'delta': warning_append})}\n\n"
                                    break

                        if streamed_any:
                            meta = {
                                "topic": topic or "general",
                                "confidence": confidence,
                                "enhanced_by_ai": True,
                                "model": self.model,
                                "clinical_reference": clinical_ref,
                            }
                            yield f"data: {json.dumps({'meta': meta})}\n\n"
                            yield "data: [DONE]\n\n"
                            return
        except Exception as exc:
            logger.warning(f"Production streaming interrupted ({exc}), falling back to dataset.")

        words = retrieved_answer.split(" ")
        for w in words:
            yield f"data: {json.dumps({'delta': w + ' '})}\n\n"
            await asyncio.sleep(0.02)

        meta = {
            "topic": topic or "general",
            "confidence": confidence,
            "enhanced_by_ai": False,
            "clinical_reference": clinical_ref,
        }
        yield f"data: {json.dumps({'meta': meta})}\n\n"
        yield "data: [DONE]\n\n"


llm_service = ProductionLLMService()
