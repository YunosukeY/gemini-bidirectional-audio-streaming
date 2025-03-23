import asyncio
from websockets.asyncio.server import serve
from genai import answer
from texttospeech import request_generator_from, text_to_speech


async def handler(websocket):
    async for query in websocket:
        text_generator = answer(query)
        request_generator = request_generator_from(text_generator)
        speech_generator = text_to_speech(request_generator)

        for chunk in speech_generator:
            await websocket.send(chunk)

        await websocket.close()


async def main():
    async with serve(handler, "localhost", 8765) as server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
