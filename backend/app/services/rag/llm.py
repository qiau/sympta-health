from langchain_openai import ChatOpenAI

from app.core.config import settings


API_KEYS = [
    key.strip()
    for key in settings.NVIDIA_API_KEYS.split(",")
]


def get_llm(api_key: str):

    return ChatOpenAI(
        model=settings.LLM_MODEL,
        api_key=api_key,
        base_url="https://integrate.api.nvidia.com/v1",
        temperature=0.3,
        max_tokens=500
    )


def invoke_llm(messages):

    last_error = None

    for api_key in API_KEYS:

        try:

            llm = get_llm(api_key)

            return llm.invoke(messages)

        except Exception as e:

            print(f"[NVIDIA API ERROR] {e}")

            last_error = e

    raise last_error