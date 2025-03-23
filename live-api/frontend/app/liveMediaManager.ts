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

export class LiveAudioInputManager {
  audioContext: AudioContext | undefined;
  processor: ScriptProcessorNode | undefined;
  pcmData: number[];

  deviceId: string | undefined;
  interval: NodeJS.Timeout | undefined;
  stream: MediaStream | undefined;

  onNewAudioRecordingChunk: ((audioData: string) => void) | undefined;

  constructor() {
    this.pcmData = [];
  }

  async connectMicrophone() {
    this.audioContext = new AudioContext({
      sampleRate: 16000,
    });

    const constraints = {
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        deviceId: this.deviceId ? { exact: this.deviceId } : undefined,
      },
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);

    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      // Convert float32 to int16
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcm16[i] = inputData[i] * 0x7fff;
      }
      this.pcmData.push(...pcm16);
    };

    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    this.interval = setInterval(this.recordChunk.bind(this), 1000);
  }

  newAudioRecording(b64AudioData: string) {
    this.onNewAudioRecordingChunk?.(b64AudioData);
  }

  recordChunk() {
    const buffer = new ArrayBuffer(this.pcmData.length * 2);
    const view = new DataView(buffer);
    this.pcmData.forEach((value, index) => {
      view.setInt16(index * 2, value, true);
    });

    const base64 = btoa(
      String.fromCharCode.apply(null, [...new Uint8Array(buffer)])
    );
    this.newAudioRecording(base64);
    this.pcmData = [];
  }

  disconnectMicrophone() {
    try {
      this.processor?.disconnect();
      this.audioContext?.close();
    } catch {
      console.error("Error disconnecting microphone");
    }

    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async updateMicrophoneDevice(deviceId: string) {
    this.deviceId = deviceId;
    this.disconnectMicrophone();
  }
}
