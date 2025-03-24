from typing import Generator
from websockets.sync.server import ServerConnection


def text_generator_from(websocket: ServerConnection) -> Generator[str]:
    for chunk in websocket:
        if chunk == "exit":
            return
        if type(chunk) is str:
            yield chunk
