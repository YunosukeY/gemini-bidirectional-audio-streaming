from websockets.sync.server import serve
from genai import answer
from texttospeech import tts_request_generator_from, text_to_speech
from speechtotext import speech_to_text, stt_request_generator_from
from websocket import text_generator_from


def handler(websocket):
    text_generator = text_generator_from(websocket)
    stt_request_generator = stt_request_generator_from(text_generator)
    query = speech_to_text(stt_request_generator)
    text_generator = answer(query)
    tts_request_generator = tts_request_generator_from(text_generator)
    speech_generator = text_to_speech(tts_request_generator)

    for chunk in speech_generator:
        websocket.send(chunk)

    websocket.close()


def main():
    with serve(handler, "localhost", 8765) as server:
        server.serve_forever()


if __name__ == "__main__":
    main()
