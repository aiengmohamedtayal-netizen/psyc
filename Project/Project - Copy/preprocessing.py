import re
from nltk.corpus import stopwords

english_stopwords = set(stopwords.words("english"))

arabic_stopwords = set([
    "في", "من", "على", "و", "يا", "عن", "الى", "إلى", "هو", "هي", "انا"
])


def clean_text(text):
    text = str(text)
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\d+", "", text)
    return text


def normalize_arabic(text):
    text = str(text)

    # remove tashkeel
    text = re.sub(r"[\u0617-\u061A\u064B-\u0652]", "", text)

    text = re.sub("[إأآا]", "ا", text)
    text = re.sub("ى", "ي", text)
    text = re.sub("ؤ", "ء", text)
    text = re.sub("ئ", "ء", text)
    text = re.sub("ة", "ه", text)

    return text


def remove_stopwords(text):
    words = text.split()
    words = [
        w for w in words
        if w not in english_stopwords and w not in arabic_stopwords
    ]
    return " ".join(words)