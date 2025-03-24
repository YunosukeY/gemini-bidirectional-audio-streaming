from typing import Generator
from google.cloud import texttospeech
import itertools

tts_client = texttospeech.TextToSpeechClient()


# See https://cloud.google.com/text-to-speech/docs/create-audio-text-streaming
def text_to_speech(
    request_generator: Generator[texttospeech.StreamingSynthesizeRequest],
) -> Generator[bytes]:
    streaming_config = texttospeech.StreamingSynthesizeConfig(
        voice=texttospeech.VoiceSelectionParams(
            name="ja-JP-Chirp3-HD-Charon", language_code="ja-JP"
        )
    )
    config_request = texttospeech.StreamingSynthesizeRequest(
        streaming_config=streaming_config
    )
    streaming_responses = tts_client.streaming_synthesize(
        itertools.chain([config_request], request_generator)
    )
    for response in streaming_responses:
        yield response.audio_content


def tts_request_generator_from(
    text_generator: Generator[str],
) -> Generator[texttospeech.StreamingSynthesizeRequest]:
    for text in text_generator:
        yield texttospeech.StreamingSynthesizeRequest(
            input=texttospeech.StreamingSynthesisInput(text=text)
        )
