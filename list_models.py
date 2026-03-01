import os
import google.generativeai as genai

api_key = "AIzaSyC0IP7q-Q-unXq0NyxeMT9jQfr42pd370I"
genai.configure(api_key=api_key)

try:
    models = list(genai.list_models())
    for m in models:
        print(m.name, m.supported_generation_methods)
except Exception as e:
    print("ERROR:", e)
