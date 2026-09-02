from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2)
)

def fit_vectorizer(texts):
    return vectorizer.fit_transform(texts)

def transform_text(texts):
    return vectorizer.transform(texts)