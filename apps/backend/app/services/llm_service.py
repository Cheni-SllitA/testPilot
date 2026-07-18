import os
from groq import Groq

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def generate_ai_response(prompt: str,  title: str, html: str) -> str:
    completion = client.chat.completions.create(
        model="qwen/qwen3-32b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert software testing assistant. "
                    "Analyze web pages and generate python scripts to test these pages."
                )
            },
            {
                "role": "user",
                "content": f"""
                   
                    title: {title}
                    html: {html}
                   
                   """
                
            }
        ],

    max_completion_tokens=4096,  # or higher — test HTML + a full script is a lot of output
    reasoning_effort="default",
    reasoning_format="hidden"
)

        
    reasoning_effort="default",  # enables reasoning
    reasoning_format="hidden"    # return only final answer
    
    print("finish_reason:", completion.choices[0].finish_reason)
    #print("content:", repr(completion.choices[0].message.content))
    return completion.choices[0].message.content