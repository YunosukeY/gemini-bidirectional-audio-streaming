// See https://github.com/microsoft/TypeScript/issues/28308
interface AudioWorkletProcessor {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}
declare let AudioWorkletProcessor: {
  prototype: AudioWorkletProcessor;
  new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};
type AudioParamDescriptor = {
  name: string;
  automationRate: "a-rate" | "k-rate";
  minValue: number;
  maxValue: number;
  defaultValue: number;
};
declare function registerProcessor(
  name: string,
  processorCtor: (new (
    options?: AudioWorkletNodeOptions
  ) => AudioWorkletProcessor) & {
    parameterDescriptors?: AudioParamDescriptor[];
  }
): undefined;

// See https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/multimodal-live-api/websocket-demo-app/frontend/pcm-processor.js
export class PCMProcessor extends AudioWorkletProcessor {
  buffer: Float32Array;

  constructor() {
    super();
    this.buffer = new Float32Array();

    this.port.onmessage = (e) => {
      const newData = e.data;
      const newBuffer = new Float32Array(this.buffer.length + newData.length);
      newBuffer.set(this.buffer);
      newBuffer.set(newData, this.buffer.length);
      this.buffer = newBuffer;
    };
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    const output = outputs[0];
    const channelData = output[0];

    if (this.buffer.length >= channelData.length) {
      channelData.set(this.buffer.slice(0, channelData.length));
      this.buffer = this.buffer.slice(channelData.length);
      return true;
    }

    return true;
  }
}
registerProcessor("pcm-processor", PCMProcessor);
