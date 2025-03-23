import asyncio
from websockets.asyncio.client import connect
from websockets.exceptions import ConnectionClosed


async def hello():
    async with connect("ws://localhost:8765") as websocket:
        await websocket.send("Hello? Gemini, are you there?")
        while True:
            try:
                message = await websocket.recv()
                print(message)
            except ConnectionClosed as e:
                print(f"Connection closed: {e}")
                break


if __name__ == "__main__":
    asyncio.run(hello())
