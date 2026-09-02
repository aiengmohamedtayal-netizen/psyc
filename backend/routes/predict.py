from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from services.model_service import model_service
from services.llm_service import llm_service
from services.clinical_service import clinical_service

router = APIRouter(tags=["Chatbot Prediction"])


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000, description="User input message")
    topic: Optional[str] = Field(None, max_length=50, description="Optional topic filter (anxiety, stress, sleep, study, motivation)")
    history: Optional[List[Dict[str, Any]]] = Field(None, description="Previous conversation turns for multi-turn context memory")


class PredictResponse(BaseModel):
    prediction: str
    confidence: float
    topic: str
    enhanced_by_ai: bool = False
    clinical_reference: Optional[Dict[str, Any]] = None


class HealthResponse(BaseModel):
    status: str
    dataset_size: int
    vectorizer_ready: bool
    available_topics: List[str]
    llm_enabled: bool
    clinical_service_ready: bool


@router.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    user_text = req.text.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")

    try:
        # 1. Fast NLP retrieval
        prediction, confidence, matched_topic = model_service.predict(user_text, req.topic)
        lang = model_service.detect_language(user_text)

        # 2. Psychiatric Clinical Reference Lookup (PubMed / NIMH / APA)
        clinical_ref = await clinical_service.get_clinical_evidence(
            query=user_text,
            topic=matched_topic,
            lang=lang,
        )

        # 3. LLM enhancement grounded in clinical evidence
        final_prediction, was_enhanced = await llm_service.enhance_response(
            user_input=user_text,
            retrieved_answer=prediction,
            topic=matched_topic,
            confidence=confidence,
            lang=lang,
            history=req.history,
            clinical_ref=clinical_ref,
        )

        return PredictResponse(
            prediction=final_prediction,
            confidence=confidence,
            topic=matched_topic,
            enhanced_by_ai=was_enhanced,
            clinical_reference=clinical_ref,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/predict/stream")
async def predict_stream(req: PredictRequest):
    user_text = req.text.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")

    try:
        # 1. Fast NLP retrieval
        prediction, confidence, matched_topic = model_service.predict(user_text, req.topic)
        lang = model_service.detect_language(user_text)

        # 2. Psychiatric Clinical Reference Lookup (PubMed / NIMH / APA)
        clinical_ref = await clinical_service.get_clinical_evidence(
            query=user_text,
            topic=matched_topic,
            lang=lang,
        )

        # 3. Streaming generator with clinical citation metadata
        generator = llm_service.stream_enhance_response(
            user_input=user_text,
            retrieved_answer=prediction,
            topic=matched_topic,
            confidence=confidence,
            lang=lang,
            history=req.history,
            clinical_ref=clinical_ref,
        )

        return StreamingResponse(
            generator,
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Streaming error: {str(e)}")


@router.get("/topics", response_model=List[str])
async def get_topics():
    return model_service.get_available_topics()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        dataset_size=len(model_service.data),
        vectorizer_ready=model_service.vectorizer is not None,
        available_topics=model_service.get_available_topics(),
        llm_enabled=llm_service.enabled,
        clinical_service_ready=True,
    )
