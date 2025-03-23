// See https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/multimodal-live-api/websocket-demo-app/frontend/live-media-manager.js

// eslint-disable-next-line import/default
import processorUrl from "./pcmProcessor.ts?url";

export class LiveAudioOutputManager {
  audioInputContext: AudioContext | undefined;
  workletNode: AudioWorkletNode | undefined;
  initialized: boolean;

  constructor() {
    this.initialized = false;
    this.initializeAudioContext();
  }

  async playAudioChunk(audioChunk: ArrayBuffer) {
    try {
      if (!this.initialized) {
        await this.initializeAudioContext();
      }

      if (this.audioInputContext?.state === "suspended") {
        await this.audioInputContext.resume();
      }

      const float32Data =
        LiveAudioOutputManager.convertPCM16LEToFloat32(audioChunk);

      this.workletNode?.port.postMessage(float32Data);
    } catch (error) {
      console.error("Error processing audio chunk:", error);
    }
  }

  async initializeAudioContext() {
    if (this.initialized) return;

    this.audioInputContext = new window.AudioContext({ sampleRate: 24000 });
    await this.audioInputContext.audioWorklet.addModule(processorUrl);
    this.workletNode = new AudioWorkletNode(
      this.audioInputContext,
      "pcm-processor"
    );
    this.workletNode.connect(this.audioInputContext.destination);

    this.initialized = true;
  }

  static convertPCM16LEToFloat32(pcmData: ArrayBuffer) {
    const inputArray = new Int16Array(pcmData);
    const float32Array = new Float32Array(inputArray.length);
    for (let i = 0; i < inputArray.length; i++) {
      float32Array[i] = inputArray[i] / 32768;
    }
    return float32Array;
  }
}
