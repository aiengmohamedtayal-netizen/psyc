from similarity import load_data, prepare_data, get_response

# تحميل الداتا
data = load_data()

# تجهيزها (vectorizer + questions)
X, questions = prepare_data(data)

print("Test started...")

while True:
    user = input("You: ")

    if user.lower() == "exit":
        break

    response = get_response(user, data, X, questions)
    print("Bot:", response)