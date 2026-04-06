from django.shortcuts import render
import requests
import os
from dotenv import load_dotenv

load_dotenv()


def home(request):
    question = ""
    answer = ""

    if request.method == "POST":
        question = request.POST.get("question", "").strip()

        if question:
            api_key = os.getenv("OPENROUTER_API_KEY")

            if not api_key:
                answer = "OPENROUTER_API_KEY is missing in your environment variables."
            else:
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                }

                site_url = os.getenv("OPENROUTER_SITE_URL")
                site_name = os.getenv("OPENROUTER_SITE_NAME")

                if site_url:
                    headers["HTTP-Referer"] = site_url
                if site_name:
                    headers["X-OpenRouter-Title"] = site_name

                payload = {
                    "model": "openai/gpt-oss-120b:free",
                    "messages": [
                        {
                            "role": "user",
                            "content": question,
                        }
                    ],
                    "max_tokens":1000
                }

                try:
                    response = requests.post(
                        url="https://openrouter.ai/api/v1/chat/completions",
                        headers=headers,
                        json=payload,
                        timeout=60,
                    )
                    response.raise_for_status()
                    result = response.json()
                    answer = (
                        result.get("choices", [{}])[0]
                        .get("message", {})
                        .get("content", "No response generated.")
                    )
                except requests.exceptions.RequestException as exc:
                    answer = f"API request failed: {exc}"
                except (KeyError, IndexError, TypeError, ValueError):
                    answer = "Received an unexpected response from the AI service."

    context = {
        "question": question,
        "answer": answer,
    }
    return render(request, "home.html", context)