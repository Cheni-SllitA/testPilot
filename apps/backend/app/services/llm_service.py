import os
from groq import Groq

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def generate_ai_response(prompt: str):
    completion = client.chat.completions.create(
        model="qwen/qwen3-32b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert software testing assistant. "
                    "Analyze web pages and generate test cases."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        reasoning_effort="default",  # enables reasoning
        reasoning_format="hidden"    # return only final answer
    )

    return completion.choices[0].message.content