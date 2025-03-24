from typing import Generator
from google import genai
import os
from dotenv import load_dotenv


load_dotenv()
PROJECT_ID = os.environ["PROJECT_ID"]

genai_client = genai.Client(
    vertexai=True,
    project=PROJECT_ID,
    location="us-central1",
)
model_id = "gemini-2.0-flash-lite-001"


# See https://ai.google.dev/api/generate-content
def answer(query: str) -> Generator[str]:
    for chunk in genai_client.models.generate_content_stream(
        model=model_id, contents=query
    ):
        if chunk.text:
            yield chunk.text
