"""
Automated unit and integration tests for the Stress AI NLP backend.
Runs directly via `python backend/test_api.py`.
"""
import sys
import os

# Reconfigure stdout for UTF-8 compatibility on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from fastapi.testclient import TestClient
from main import app
from services.model_service import model_service


def test_model_service():
    print("Testing ModelService initialization...")
    assert len(model_service.data) > 0, f"Expected dataset entries, got {len(model_service.data)}"
    assert model_service.vectorizer is not None, "Vectorizer not fitted"
    assert len(model_service.topics) > 0, "No topics detected"
    print(f"[PASS] ModelService loaded {len(model_service.data)} QA pairs across topics: {model_service.topics}")


    # Arabic query test
    ar_query = "حاسس بقلق طول الوقت"
    ans, conf, topic = model_service.predict(ar_query)
    assert ans and conf > 0.4, f"Arabic prediction failed: conf={conf}"
    assert any('\u0600' <= c <= '\u06FF' for c in ans), "Expected Arabic answer"
    print(f"[PASS] Arabic Query passed -> Conf: {conf:.2f}, Topic: {topic}")

    # English query test
    en_query = "i feel stressed and overwhelmed"
    ans_en, conf_en, topic_en = model_service.predict(en_query)
    assert ans_en and conf_en > 0.2, f"English prediction failed: conf={conf_en}"
    assert not any('\u0600' <= c <= '\u06FF' for c in ans_en), "Expected English answer"
    print(f"[PASS] English Query passed -> Conf: {conf_en:.2f}, Topic: {topic_en}")

    # Category boost test
    sleep_query = "i can't sleep at night"
    ans_sleep, conf_sleep, topic_sleep = model_service.predict(sleep_query, topic="sleep")
    assert ans_sleep and conf_sleep > 0.2
    print(f"[PASS] Topic-boosted Query passed -> Conf: {conf_sleep:.2f}, Topic: {topic_sleep}")


def test_fastapi_endpoints():
    print("\nTesting FastAPI API endpoints...")
    client = TestClient(app)

    # Test /health
    res = client.get("/health")
    assert res.status_code == 200
    health_data = res.json()
    assert health_data["status"] == "ok"
    assert health_data["dataset_size"] > 0
    print(f"[PASS] GET /health: 200 OK (Dataset size: {health_data['dataset_size']})")

    # Test /topics
    res = client.get("/topics")
    assert res.status_code == 200
    topics = res.json()
    assert isinstance(topics, list) and len(topics) > 0
    print(f"[PASS] GET /topics: 200 OK (Topics: {topics})")

    # Test /predict valid
    res = client.post("/predict", json={"text": "How can I reduce anxiety?", "topic": "anxiety"})
    assert res.status_code == 200
    pred = res.json()
    assert "prediction" in pred and "confidence" in pred
    print(f"[PASS] POST /predict (Valid): 200 OK (Confidence: {pred['confidence']})")

    # Test /predict empty text
    res = client.post("/predict", json={"text": "   "})
    assert res.status_code in [400, 422]
    print(f"[PASS] POST /predict (Empty validation): {res.status_code} properly rejected")


if __name__ == "__main__":
    test_model_service()
    test_fastapi_endpoints()
    print("\n=== ALL BACKEND TESTS PASSED SUCCESSFULLY! ===")

