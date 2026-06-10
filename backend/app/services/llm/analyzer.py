import json

from openai import OpenAI

from app.core.config import settings
from app.services.llm.prompts import SYSTEM_PROMPT


API_KEYS = [
    key.strip()
    for key in settings.NVIDIA_API_KEYS.split(",")
]


def get_client(api_key: str):

    return OpenAI(
        api_key=api_key,
        base_url="https://integrate.api.nvidia.com/v1",
        timeout=30
    )


def analyze_patient_complaint(text: str):

    last_error = None

    for api_key in API_KEYS:

        try:

            client = get_client(api_key)

            response = client.chat.completions.create(
                model=settings.LLM_MODEL,
                temperature=0.3,
                max_tokens=500,
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": text
                    }
                ]
            )

            content = response.choices[0].message.content

            return json.loads(content)

        except Exception as e:

            print(f"[NVIDIA API ERROR] {e}")

            last_error = e

    raise last_error