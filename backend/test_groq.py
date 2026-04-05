"""Quick test to check if Groq API key works"""
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
print(f"API Key found: {api_key[:10]}...{api_key[-5:]}" if api_key else "NO API KEY FOUND!")

client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=api_key)

# Test 1: List models
print("\n--- Testing model list ---")
try:
    models = client.models.list()
    print(f"Available models ({len(models.data)}):")
    for m in models.data[:10]:
        print(f"  - {m.id}")
except Exception as e:
    print(f"ERROR listing models: {type(e).__name__}: {e}")

# Test 2: Simple chat
print("\n--- Testing chat completion ---")
models_to_try = [
    "llama-3.3-70b-versatile",
    "qwen/qwen3-32b",
    "llama-3.1-8b-instant",
]

for model in models_to_try:
    try:
        print(f"Trying model: {model}...")
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say hi in 3 words"}],
            max_tokens=20,
            temperature=0.5,
        )
        print(f"  ✅ SUCCESS: {response.choices[0].message.content}")
        break
    except Exception as e:
        print(f"  ❌ FAILED: {type(e).__name__}: {e}")

print("\nDone!")
