import pandas as pd
import json

# preprocessing
from preprocessing import clean_text, normalize_arabic, remove_stopwords

# model
from model import train_model

# similarity
from similarity import load_data, prepare_data, get_response

# vectorizer
from vectorizer import transform_text


# =========================
# 1. Load Dataset
# =========================

def load_dataframe(path="data.json"):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    df = pd.DataFrame(data)
    return df, data


# =========================
# 2. Preprocess DataFrame
# =========================

def preprocess_df(df):
    df["clean_question"] = (
        df["question"]
        .apply(clean_text)
        .apply(normalize_arabic)
        .apply(remove_stopwords)
    )
    return df


# =========================
# 3. Detect Language
# =========================

def is_arabic(text):
    return any("\u0600" <= c <= "\u06FF" for c in text)


# =========================
# 4. Filter Answer by Language
# =========================

def filter_by_language(answer, user_input):
    if is_arabic(user_input):
        return any("\u0600" <= c <= "\u06FF" for c in answer)
    else:
        return not any("\u0600" <= c <= "\u06FF" for c in answer)


# =========================
# 5. Chatbot Class
# =========================

class ChatBot:
    def __init__(self):
        print("Loading data...")

        # load
        self.df, self.data = load_dataframe()

        # preprocess
        self.df = preprocess_df(self.df)

        # prepare similarity
        print("Preparing similarity model...")
        self.X, self.questions = prepare_data(self.data)

        # train model
        print("Training model...")
        self.model = train_model(self.df)

        print("Chatbot is ready 🚀")

    # =====================
    # Predict Label (Intent)
    # =====================
    def predict_label(self, user_input):
        cleaned = remove_stopwords(
            normalize_arabic(
                clean_text(user_input)
            )
        )
        vec = transform_text([cleaned])
        return self.model.predict(vec)[0]

    # =====================
    # Get Response (HYBRID 🔥)
    # =====================
    def get_bot_response(self, user_input):

        # 1. حدد ال label الأول
        label = self.predict_label(user_input)

        # 2. فلتر الداتا حسب ال label
        filtered_data = [
            item for item in self.data if item["label"] == label
        ]

        # 3. اعمل similarity بس جوه ال label ده
        X_filtered, questions_filtered = prepare_data(filtered_data)

        response = get_response(
            user_input,
            filtered_data,
            X_filtered,
            questions_filtered
        )

        return response


# =========================
# 6. Run Chatbot
# =========================

if __name__ == "__main__":
    bot = ChatBot()

    while True:
        user_input = input("You: ")

        if user_input.lower() in ["exit", "quit"]:
            print("Bot: Bye 👋")
            break

        response = bot.get_bot_response(user_input)
        print("Bot:", response)