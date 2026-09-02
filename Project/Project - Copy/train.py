import pandas as pd

from preprocessing import clean_text, normalize_arabic, remove_stopwords
from model import train_model


df = pd.read_json("data.json")


df["clean_question"] = (
    df["question"]
    .apply(clean_text)
    .apply(normalize_arabic)
    .apply(remove_stopwords)
)


model = train_model(df)