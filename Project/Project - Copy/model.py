import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

from vectorizer import fit_vectorizer

def train_model(df):
    
    X_text = df["clean_question"]
    y = df["label"]


    X = fit_vectorizer(X_text)

    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    
    model = LogisticRegression(max_iter=1000)

    
    model.fit(X_train, y_train)

    
    y_pred = model.predict(X_test)

    
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    return model
