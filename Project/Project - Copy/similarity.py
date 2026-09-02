import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from vectorizer import fit_vectorizer, transform_text
from preprocessing import clean_text, normalize_arabic, remove_stopwords


# ================= LOAD DATA =================
def load_data(path="data.json"):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


# ================= PREPARE =================
def prepare_data(data):
    questions = [
        remove_stopwords(
            normalize_arabic(
                clean_text(item["question"])
            )
        )
        for item in data
    ]

    X = fit_vectorizer(questions)
    return X, questions


# ================= LANGUAGE DETECTION =================
def detect_language(text):
    for char in text:
        if '\u0600' <= char <= '\u06FF':
            return "ar"
    return "en"


# ================= RESPONSE =================
def get_response(user_input, data, X, questions, threshold=0.3):

    # تحديد اللغة
    lang = detect_language(user_input)

    # تنظيف السؤال
    user_input_clean = remove_stopwords(
        normalize_arabic(
            clean_text(user_input)
        )
    )

    user_vec = transform_text([user_input_clean])

    similarities = cosine_similarity(user_vec, X)

    # ترتيب النتائج من الأعلى للأقل
    sorted_indices = similarities[0].argsort()[::-1]

    for idx in sorted_indices:
        answer = data[idx]["answer"]

        # لو عربي → رجع عربي بس
        if lang == "ar" and any('\u0600' <= c <= '\u06FF' for c in answer):
            return answer

        # لو إنجليزي → رجع إنجليزي بس
        if lang == "en" and all(ord(c) < 128 for c in answer):
            return answer

    # fallback
    if lang == "en":
        return "I'm here for you  Could you explain more?"
    else:
        return "مش فاهمك  حاول توضح أكتر"