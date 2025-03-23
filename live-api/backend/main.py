from google import genai
from google.genai.types import (
    LiveConnectConfig,
    HttpOptions,
    SpeechConfig,
    VoiceConfig,
    PrebuiltVoiceConfig,
)
import asyncio
import os
from dotenv import load_dotenv
import asyncio
from websockets.asyncio.server import serve
import base64


load_dotenv()
PROJECT_ID = os.environ["PROJECT_ID"]

client = genai.Client(
    http_options=HttpOptions(api_version="v1beta1"),
    vertexai=True,
    project=PROJECT_ID,
    location="us-central1",
)
model_id = "gemini-2.0-flash-exp"

live_connect_config = LiveConnectConfig(
    response_modalities=["AUDIO"],
    speech_config=SpeechConfig(
        voice_config=VoiceConfig(
            prebuilt_voice_config=PrebuiltVoiceConfig(
                voice_name="Aoede",
            )
        )
    ),
)


# See https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/multimodal-live-api/intro_multimodal_live_api_genai_sdk.ipynb
async def handler(websocket):
    async with client.aio.live.connect(
        model=model_id,
        config=live_connect_config,
    ) as session:
        async def send():
            async for data in websocket:
                if data == "exit":
                    break
                await session.send(input={
                    "media_chunks": [{
                        "data": data,
                        "mime_type": "audio/pcm",
                    }],
                })
        send_task = asyncio.create_task(send())

        async for response in session.receive():
            if (
                response.server_content.model_turn
                and response.server_content.model_turn.parts
            ):
                for part in response.server_content.model_turn.parts:
                    if part.inline_data:
                        await websocket.send(part.inline_data.data)

        while not send_task.done():
            await asyncio.sleep(1)
        await websocket.close()


async def main():
    async with serve(handler, "localhost", 8765) as server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
