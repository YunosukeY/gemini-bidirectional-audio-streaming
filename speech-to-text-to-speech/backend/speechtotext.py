from typing import Generator
from google.cloud import speech

speech_client = speech.SpeechClient()


def speech_to_text(request_generator: Generator[speech.StreamingRecognizeRequest]):
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="ja-JP",
    )
    streaming_config = speech.StreamingRecognitionConfig(config=config)
    responses = speech_client.streaming_recognize(
        config=streaming_config,
        requests=request_generator,
    )
    transcript = ""
    for response in responses:
        for result in response.results:
            for alternative in result.alternatives:
                print(f"Transcript: {alternative.transcript}")
                transcript += alternative.transcript
    return transcript


def stt_request_generator_from(
    text_generator: Generator[str],
) -> Generator[speech.StreamingRecognizeRequest]:
    for text in text_generator:
        yield speech.StreamingRecognizeRequest(audio_content=text)
