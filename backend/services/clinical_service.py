import logging
import urllib.parse
from typing import Optional, Dict, Any
import httpx

logger = logging.getLogger("stress_ai.clinical_service")

# ═══════════════════════════════════════════════════════════
# GOLD-STANDARD PSYCHIATRIC & PSYCHOLOGICAL KNOWLEDGE BASE
# (APA, NIMH, WHO, AASM, Beck Institute)
# ═══════════════════════════════════════════════════════════
CLINICAL_PROTOCOLS = {
    "anxiety": {
        "source": "APA & National Institute of Mental Health (NIMH)",
        "source_ar": "الجمعية الأمريكية للطب النفسي (APA) والمعهد القومي للصحة النفسية (NIMH)",
        "title": "Cognitive Behavioral Restructuring & Sensory Grounding Protocol",
        "title_ar": "بروتوكول إعادة الهيكلة المعرفية والتأريض الحسي (CBT)",
        "evidence_summary": "First-line evidence-based protocol for interrupting panic loops and acute anxiety via parasympathetic activation.",
        "evidence_summary_ar": "البروتوكول المعتمد كخط علاج أول لتفكيك حلقات القلق المفرط عبر تحفيز الجهاز العصبي الباراسمبثاوي.",
        "citation": "APA Clinical Practice Guidelines / NIMH Health Topics",
        "url": "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
        "pubmed_term": "anxiety cognitive behavioral therapy grounding",
    },
    "sleep": {
        "source": "American Academy of Sleep Medicine (AASM) & PubMed",
        "source_ar": "الأكاديمية الأمريكية لطب النوم (AASM) والمكتبة الطبية الوطنية (PubMed)",
        "title": "Clinical Practice Guideline: Cognitive Behavioral Therapy for Insomnia (CBT-I)",
        "title_ar": "الدليل الإكلينيكي لعلاج الأرق السلوكي المعرفي (CBT-I)",
        "evidence_summary": "Recommended by AASM and ACP as first-line intervention over pharmacotherapy for sleep onset insomnia.",
        "evidence_summary_ar": "موصى به رسمياً كخط علاج أولي متفوق على المنومات الدوائية لضبط الساعة البيولوجية والأرق.",
        "citation": "AASM / Ann Intern Med (PubMed ID: 2799857)",
        "url": "https://pubmed.ncbi.nlm.nih.gov/2799857/",
        "pubmed_term": "insomnia stimulus control sleep hygiene CBT",
    },
    "stress": {
        "source": "World Health Organization (WHO mhGAP) & Harvard Health",
        "source_ar": "منظمة الصحة العالمية (WHO) ودراسات هارفارد الطبية",
        "title": "Evidence-Based Somatic Stress Management & Vagal Regulation",
        "title_ar": "إدارة الإجهاد والتوتر الجسدي وتنشيط العصب الحائر",
        "evidence_summary": "Progressive somatic de-escalation shown to decrease salivary cortisol and somatic tension significantly.",
        "evidence_summary_ar": "إرخاء العضلات التدريجي والتنفس البطني الموجه لتخفيض هرمون الكورتيزول والإجهاد البدني.",
        "citation": "WHO mhGAP Evidence Resource / Harvard Medical Publishing",
        "url": "https://www.who.int/publications/i/item/9789240003927",
        "pubmed_term": "stress reduction progressive muscle relaxation cortisol",
    },
    "study": {
        "source": "British Psychological Society (BPS) & Cognitive Neuroscience",
        "source_ar": "الجمعية البريطانية لعلم النفس (BPS) وأبحاث العلوم العصبية المعرفية",
        "title": "Academic Anxiety & Executive Functioning Optimization",
        "title_ar": "تحسين الوظائف التنفيذية وتخفيف قلق الاختبارات",
        "evidence_summary": "Cognitive chunking and timed intervals (Pomodoro) reduce prefrontal cortex cognitive overload during study sessions.",
        "evidence_summary_ar": "تقسيم المهام وتفتيت العبء المعرفي لاستعادة تركيز الفص الجبهي وتجنب التسويف القهري.",
        "citation": "BPS Cognitive Guidelines / PubMed Educational Studies",
        "url": "https://pubmed.ncbi.nlm.nih.gov/",
        "pubmed_term": "academic stress exam anxiety cognitive intervention",
    },
    "motivation": {
        "source": "Beck Institute for CBT & Clinical Psychology Review",
        "source_ar": "معهد بيك للعلاج السلوكي المعرفي ودوريات علم النفس الإكلينيكي",
        "title": "Behavioral Activation Protocol for Anhedonia and Inertia",
        "title_ar": "بروتوكول التنشيط السلوكي (Behavioral Activation) لكسر الإحباط",
        "evidence_summary": "Behavioral Activation systematically initiates dopamine reward pathways before motivation spontaneously occurs.",
        "evidence_summary_ar": "بدء الفعل الصغير (Micro-action) يحفز مسارات الدوبامين قبل الشعور بالرغبة، مما يكسر حلقة العطالة النفسية.",
        "citation": "Clin Psychol Rev / Beck Institute Empirical Studies",
        "url": "https://beckinstitute.org/",
        "pubmed_term": "behavioral activation anhedonia depression CBT",
    },
    "addiction": {
        "source": "National Institute on Drug Abuse (NIDA) & WHO",
        "source_ar": "المعهد القومي الأمريكي لعلاج الإدمان (NIDA) وصندوق مكافحة الإدمان",
        "title": "Evidence-Based Substance Recovery & Detoxification Protocol",
        "title_ar": "بروتوكول التعافي من الإدمان وسحب السموم والدعم السلوكي (خط 16023)",
        "evidence_summary": "Medical detoxification combined with cognitive behavioral relapse prevention therapy (CBT). In Egypt, contact hotline 16023 for confidential free treatment.",
        "evidence_summary_ar": "سحب السموم تحت إشراف طبي مع العلاج السلوكي لمنع الانتكاس. في مصر: الخط الساخن لصندوق مكافحة الإدمان 16023 مجاناً وفي سرية تامة.",
        "citation": "NIDA Clinical Recovery Guidelines / WHO mhGAP",
        "url": "https://nida.nih.gov/",
        "pubmed_term": "substance addiction cognitive behavioral therapy relapse prevention",
    },
}

DEFAULT_PROTOCOL = {
    "source": "National Institute of Mental Health (NIMH) & WHO",
    "source_ar": "المعهد القومي الأمريكي للصحة النفسية (NIMH) ومنظمة الصحة العالمية",
    "title": "Evidence-Based Psychoeducation and Emotional Wellbeing Framework",
    "title_ar": "الإطار الإرشادي للرعاية النفسية الذاتية والتوعية السلوكية",
    "evidence_summary": "General emotional regulation principles grounded in compassionate active listening and cognitive restructuring.",
    "evidence_summary_ar": "مبادئ التنظيم العاطفي والدعم النفسي المبكر المستندة إلى الاستماع الفعال وإعادة التقييم المعرفي.",
    "citation": "NIMH Public Mental Health Guidelines",
    "url": "https://www.nimh.nih.gov/",
}


class ClinicalPsychiatryService:
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    async def get_clinical_evidence(
        self,
        query: str,
        topic: Optional[str] = None,
        lang: str = "ar",
    ) -> Dict[str, Any]:
        """
        Retrieves authoritative psychiatric and clinical evidence for the user query.
        Returns a rich reference dictionary including organization, protocol title, evidence summary, and citation.
        """
        # 1. Topic Mapping (Query keywords prioritized)
        lower_q = query.lower()
        if any(w in lower_q for w in ["ادمان", "مخدرات", "تعاطي", "خمور", "حشيش", "هيروين", "شابو", "addiction", "substance", "drugs", "detox"]):
            topic_key = "addiction"
        elif any(w in lower_q for w in ["نوم", "انام", "أرق", "صاحي", "sleep", "insomnia", "wake"]):
            topic_key = "sleep"
        elif any(w in lower_q for w in ["قلق", "خايف", "رعب", "هلع", "anxious", "anxiety", "panic"]):
            topic_key = "anxiety"
        elif any(w in lower_q for w in ["مذاكرة", "امتحان", "دراسة", "تركيز", "study", "exam", "focus"]):
            topic_key = "study"
        elif any(w in lower_q for w in ["شغف", "احباط", "محبط", "كسل", "motivation", "procrastinat"]):
            topic_key = "motivation"
        elif any(w in lower_q for w in ["ضغط", "توتر", "مخنوق", "stress", "stressed", "overwhelmed"]):
            topic_key = "stress"
        else:
            topic_key = (topic or "").lower().strip()
            if topic_key not in CLINICAL_PROTOCOLS:
                topic_key = "stress"

        base_proto = CLINICAL_PROTOCOLS.get(topic_key, DEFAULT_PROTOCOL)

        # 2. Check in-memory cache for live PubMed ID
        cache_key = f"{topic_key}_{lang}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        # 3. Attempt live PubMed PMC query with fast 2-second timeout
        pubmed_term = base_proto.get("pubmed_term", "mental health CBT")
        pmc_id = None
        try:
            term_encoded = urllib.parse.quote(f"{pubmed_term} clinical trial")
            url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term={term_encoded}&retmode=json&retmax=1"
            headers = {"User-Agent": "StressAI-ClinicalEngine/2.0"}

            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    idlist = data.get("esearchresult", {}).get("idlist", [])
                    if idlist:
                        pmc_id = idlist[0]
        except Exception as err:
            logger.debug(f"Live PubMed fetch skipped or timed out: {err}")

        # 4. Assemble final clinical reference
        citation_str = base_proto["citation"]
        pubmed_url = base_proto["url"]

        if pmc_id:
            citation_str += f" (PubMed PMC ID: {pmc_id})"
            pubmed_url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{pmc_id}/"

        result = {
            "topic": topic_key,
            "source": base_proto["source_ar"] if lang == "ar" else base_proto["source"],
            "title": base_proto["title_ar"] if lang == "ar" else base_proto["title"],
            "evidence_summary": (
                base_proto["evidence_summary_ar"] if lang == "ar" else base_proto["evidence_summary"]
            ),
            "citation": citation_str,
            "url": pubmed_url,
            "pmc_id": pmc_id,
        }

        self._cache[cache_key] = result
        return result


clinical_service = ClinicalPsychiatryService()
