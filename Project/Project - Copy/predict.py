# predict.py

from similarity import load_data, prepare_data, get_response


# تحميل البيانات من ملف JSON
data = load_data("data.json")


# تجهيز البيانات (تنضيف + تحويل لـ vectors)
X, questions = prepare_data(data)


def predict(user_input):
    """
    تاخد input من المستخدم وترجع الرد المناسب
    """
    response = get_response(user_input, data, X, questions)
    return response


# تشغيل الشات بوت من التيرمنال
if __name__ == "__main__":
    print("🤖 Chatbot is ready! (اكتب exit للخروج)\n")

    while True:
        user_input = input("You: ")

        # خروج
        if user_input.lower() in ["exit", "quit"]:
            print("Bot: مع السلامة 👋")
            break

        # التأكد إن المستخدم كتب حاجة
        if user_input.strip() == "":
            print("Bot: اكتب حاجة الأول 😊")
            continue

        # التوقع
        response = predict(user_input)

        print("Bot:", response)