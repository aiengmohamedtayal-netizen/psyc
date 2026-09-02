"""
Egyptian & Colloquial Arabic Dialect Normalizer & Semantic Intent Mapper.
Transforms emotional colloquial phrases into clinical concepts for accurate RAG retrieval.
"""

from typing import Dict, List, Tuple
import re

# Comprehensive dictionary mapping colloquial emotional phrases to clinical concepts and topics
DIALECT_INTENT_MAP: List[Tuple[re.Pattern, str, str]] = [
    # Somatic anxiety & Suffocation feelings
    (re.compile(r"\b(مخنوق|حاسس بخنق[ةه]|هموت من الخنق[ةه]|نفسي مكتوم|صدري ضايق)\b", re.I), "anxiety", "صعوبة في التنفس وضيق في الصدر وتوتر حاد قلق"),
    
    # Severe irritability, emotional exhaustion & burnout
    (re.compile(r"\b(مش طايق نفسي|مش طايق حد|مش طايق عيشتي|فاض بيا|على آخري|طاقتي خلصت|منهار)\b", re.I), "stress", "إجهاد نفسي حاد استنزاف طاقة عصبي واحتراق نفسي"),
    
    # Overthinking & Racing thoughts
    (re.compile(r"\b(دماغي هتنفجر|مخي شغال ع الفاضي|تفكير مبيهداش|مش عارف ابطل تفكير|أفكار كتير ف دماغي)\b", re.I), "anxiety", "تفكير مفرط واجترار الأفكار تسارع ذهني وقلق"),
    
    # Insomnia & Sleep disturbances
    (re.compile(r"\b(مش جايلي نوم|عيني مش شايفة النوم|سهران ومبنامش|بتقلب ف[ي]? السرير|مش عارف انام|الأرق قاتلني)\b", re.I), "sleep", "صعوبة في الاستغراق في النوم أرق اضطراب الساعة البيولوجية"),
    
    # Panic attack & Palpitations
    (re.compile(r"\b(قلبي بيدق جامد|ضربات قلبي سريعة|هموت من الرعب|حاسس اني هموت من الخوف|رعشة ف ايدي)\b", re.I), "anxiety", "نوبة هلع تسارع ضربات القلب استثارة عصبية حادة تأريض حسي"),
    
    # Lack of motivation, procrastination & Anhedonia
    (re.compile(r"\b(فاقد الشغف|معنديش طاقة|مكسل ومش عارف ابدأ|حاسس بعجز|مليش نفس لأي حاجة|تعبت ومفيش فايدة)\b", re.I), "motivation", "فقدان الشغف والتنشيط السلوكي انعدام الدافعية تسويف"),
    
    # Academic / Study overload & Exam fear
    (re.compile(r"\b(مش مجمع ف المذاكرة|تايه ف المنهج|امتحاني بكرة ومش فاكر حاجة|خايف اسقط|مش مركز خالص)\b", re.I), "study", "قلق الامتحانات وتشتت الانتباه صعوبات التركيز في المذاكرة وتقسيم المهام"),
    
    # Substance recovery & Addiction colloquial terms
    (re.compile(r"\b(عايز ابطل|مش قادر اوقف شرب|ادمان الحشيش|عايز اتعالج من المخدرات|السموم ف جسمي)\b", re.I), "addiction", "التعافي من الإدمان وسحب السموم والدعم السلوكي والنفسي صندوق مكافحة الإدمان 16023"),
]


def expand_dialect_query(query: str) -> Tuple[str, str | None]:
    """
    Analyzes colloquial expressions in the user query.
    Returns a tuple of (expanded_query, suggested_topic).
    """
    detected_topic = None
    enrichments: List[str] = []

    for pattern, topic, enrichment in DIALECT_INTENT_MAP:
        if pattern.search(query):
            if not detected_topic:
                detected_topic = topic
            enrichments.append(enrichment)

    if enrichments:
        expanded = f"{query} {' '.join(enrichments)}"
        return expanded, detected_topic

    return query, None
