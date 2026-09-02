import os
import json
import logging
from typing import Optional, Tuple, List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

try:
    from utils.preprocessing import preprocess_text
    from utils.dialect_mapper import expand_dialect_query
except ImportError:
    from backend.utils.preprocessing import preprocess_text
    from backend.utils.dialect_mapper import expand_dialect_query

logger = logging.getLogger("model_service")

DEFAULT_THRESHOLD = float(os.getenv("MODEL_THRESHOLD", "0.20"))


class ModelService:
    def __init__(self, threshold: float = DEFAULT_THRESHOLD):
        self.threshold = threshold
        self.data: List[Dict[str, Any]] = []
        self.questions_preprocessed: List[str] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.X = None
        self.topics: List[str] = []
        self.load_and_prepare()

    def load_and_prepare(self) -> None:
        """Loads canonical dataset, preprocesses questions, and fits TF-IDF vectorizer."""
        data_paths = [
            os.path.join(os.path.dirname(__file__), "..", "data", "data.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "data", "data.json"),
            os.path.join(os.getcwd(), "backend", "data", "data.json"),
            os.path.join(os.getcwd(), "data", "data.json"),
            "/var/task/backend/data/data.json",
            "/var/task/data/data.json",
        ]

        loaded_data = []
        for path in data_paths:
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        raw = json.load(f)
                        if isinstance(raw, list) and len(raw) > 0:
                            loaded_data = raw
                            logger.info(f"Loaded {len(loaded_data)} items from {path}")
                            break
                except Exception as e:
                    logger.warning(f"Failed to read dataset from {path}: {e}")

        canonical_items: List[Dict[str, Any]] = []
        for item in loaded_data:
            label = item.get("label") or item.get("topic") or "general"
            answer = item.get("answer", "").strip()
            q_val = item.get("question") or item.get("questions")
            if not answer:
                continue

            if isinstance(q_val, list):
                for q in q_val:
                    if str(q).strip():
                        canonical_items.append({
                            "question": str(q).strip(),
                            "answer": answer,
                            "label": str(label).strip().lower()
                        })
            elif q_val and str(q_val).strip():
                canonical_items.append({
                    "question": str(q_val).strip(),
                    "answer": answer,
                    "label": str(label).strip().lower()
                })

        self.data = canonical_items
        self.topics = sorted(list({item["label"] for item in self.data if item["label"] != "general"}))

        if not self.data:
            logger.error("No valid dataset entries found.")
            return

        self.questions_preprocessed = [
            preprocess_text(item["question"]) for item in self.data
        ]

        self.vectorizer = TfidfVectorizer(
            max_features=6000,
            ngram_range=(1, 2),
            sublinear_tf=True
        )
        self.X = self.vectorizer.fit_transform(self.questions_preprocessed)
        logger.info(f"Fitted TF-IDF Vectorizer with {len(self.questions_preprocessed)} questions.")

    @staticmethod
    def detect_language(text: str) -> str:
        """Determines if text is primarily Arabic ('ar') or English ('en')."""
        for char in text:
            if '\u0600' <= char <= '\u06FF':
                return "ar"
        return "en"

    def get_available_topics(self) -> List[str]:
        return self.topics

    def predict(self, user_input: str, topic: Optional[str] = None) -> Tuple[str, float, str]:
        """
        Matches user query against knowledge base.
        Returns: (answer, confidence_score, matched_topic)
        """
        if not self.data or self.X is None or self.vectorizer is None:
            return "I'm sorry, my knowledge base is currently unavailable.", 0.0, "general"

        user_input_raw = user_input.strip()
        lang = self.detect_language(user_input_raw)

        # Colloquial Egyptian / Arabic dialect enrichment
        expanded_query, dialect_suggested_topic = expand_dialect_query(user_input_raw)
        if not topic and dialect_suggested_topic:
            norm_topic = dialect_suggested_topic
        else:
            norm_topic = topic.strip().lower() if topic else None

        user_prep = preprocess_text(expanded_query)

        # 1. Exact or substring search
        for idx, item in enumerate(self.data):
            q_prep = self.questions_preprocessed[idx]
            if not q_prep:
                continue

            if norm_topic and item["label"] != norm_topic:
                continue

            if user_prep == q_prep or (len(user_prep) >= 4 and (user_prep in q_prep or q_prep in user_prep)):
                ans = item["answer"]
                is_ans_ar = any('\u0600' <= c <= '\u06FF' for c in ans)
                if (lang == "ar" and is_ans_ar) or (lang == "en" and not is_ans_ar):
                    return ans, 1.0, item["label"]

        # 2. TF-IDF & Cosine Similarity
        user_vec = self.vectorizer.transform([user_prep if user_prep else user_input_raw])
        similarities = cosine_similarity(user_vec, self.X)[0]

        # Apply topic boost if user selected a category
        if norm_topic:
            for idx, item in enumerate(self.data):
                if item["label"] == norm_topic:
                    similarities[idx] *= 1.25

        sorted_indices = similarities.argsort()[::-1]

        for idx in sorted_indices:
            score = float(similarities[idx])
            if score < self.threshold:
                break

            item = self.data[idx]
            answer = item["answer"]

            is_ans_ar = any('\u0600' <= c <= '\u06FF' for c in answer)
            if (lang == "ar" and is_ans_ar) or (lang == "en" and not is_ans_ar):
                return answer, min(round(score, 3), 1.0), item["label"]

        # 3. Fallback
        if lang == "ar":
            fallback = "أنا هنا عشان أساعدك وأسمعك. ممكن توضح أكتر حاسس بإيه أو إيه اللي مضايقك؟"
        else:
            fallback = "I'm here for you. Could you share a bit more about what you're experiencing?"

        top_score = float(similarities[sorted_indices[0]]) if len(sorted_indices) > 0 else 0.0
        return fallback, round(top_score, 3), norm_topic or "general"


model_service = ModelService()
