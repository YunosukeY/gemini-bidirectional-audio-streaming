from google import genai
import asyncio
import os
from dotenv import load_dotenv
import asyncio
from websockets.asyncio.server import serve


load_dotenv()
PROJECT_ID = os.environ["PROJECT_ID"]

client = genai.Client(
    vertexai=True,
    project=PROJECT_ID,
    location="us-central1",
)
model_id = "gemini-2.0-flash-lite-001"


async def handler(websocket):
    async for query in websocket:
        print(f"Received: {query}")

        for chunk in client.models.generate_content_stream(
            model=model_id, contents=query
        ):
            print(f"Received: {chunk.text}")
            await websocket.send(chunk.text)

        await websocket.close()


async def main():
    async with serve(handler, "localhost", 8765) as server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
