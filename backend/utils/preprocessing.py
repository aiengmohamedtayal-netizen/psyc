import re

# Comprehensive built-in stopwords to eliminate hard external NLTK dependencies
DEFAULT_ENGLISH_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
    "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
    "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
    "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
    "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
    "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
    "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
    "yourselves"
}

ARABIC_STOPWORDS = {
    "في", "من", "على", "و", "يا", "عن", "الى", "إلى", "هو", "هي", "انا", "أنا", "انت", "أنت",
    "كان", "كانت", "ان", "أن", "إن", "هذا", "هذه", "ذلك", "تلك", "مع", "كل", "قد", "ما", "لا"
}

# Optional fallback to nltk if installed
try:
    import nltk
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords', quiet=True)
    from nltk.corpus import stopwords
    english_stopwords = set(stopwords.words("english"))
except Exception:
    english_stopwords = DEFAULT_ENGLISH_STOPWORDS

arabic_stopwords = ARABIC_STOPWORDS


def clean_text(text: str) -> str:
    """Removes URLs, punctuation, digits, and extra spaces."""
    text = str(text).lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\d+", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_arabic(text: str) -> str:
    """Normalizes Arabic letters and strips diacritics/tashkeel."""
    text = str(text)
    # Remove tashkeel
    text = re.sub(r"[\u0617-\u061A\u064B-\u0652]", "", text)
    # Normalize common letter variations
    text = re.sub("[إأآا]", "ا", text)
    text = re.sub("ى", "ي", text)
    text = re.sub("ؤ", "ء", text)
    text = re.sub("ئ", "ء", text)
    text = re.sub("ة", "ه", text)
    return text


def remove_stopwords(text: str) -> str:
    """Filters stopwords while ensuring query does not become empty."""
    words = text.split()
    filtered = [
        w for w in words
        if w not in english_stopwords and w not in arabic_stopwords
    ]
    result = " ".join(filtered)
    return result if result.strip() else text


def preprocess_text(text: str) -> str:
    """Full preprocessing pipeline."""
    cleaned = clean_text(text)
    normalized = normalize_arabic(cleaned)
    return remove_stopwords(normalized).strip()