from google import genai
from google.genai.types import LiveConnectConfig, HttpOptions, Modality
import asyncio
import os
from dotenv import load_dotenv
import asyncio
from websockets.asyncio.server import serve


load_dotenv()
PROJECT_ID = os.environ["PROJECT_ID"]

client = genai.Client(
    http_options=HttpOptions(api_version="v1beta1"),
    vertexai=True,
    project=PROJECT_ID,
    location="us-central1",
)
model_id = "gemini-2.0-flash-exp"


async def handler(websocket):
    async with client.aio.live.connect(
        model=model_id,
        config=LiveConnectConfig(response_modalities=[Modality.TEXT]),
    ) as session:
        async for query in websocket:
            print(f"Received: {query}")
            await session.send(input=query, end_of_turn=True)

            async for answer in session.receive():
                if answer.text:
                    print(f"Received: {answer.text}")
                    await websocket.send(answer.text)
            await websocket.close()


async def main():
    async with serve(handler, "localhost", 8765) as server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
