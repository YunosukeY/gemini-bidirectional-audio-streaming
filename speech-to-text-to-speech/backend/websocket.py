from typing import Generator


def text_generator_from(websocket) -> Generator[str]:
    for chunk in websocket:
        if chunk == "exit":
            return
        yield chunk
