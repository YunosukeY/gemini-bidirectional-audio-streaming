// See https://github.com/GoogleCloudPlatform/generative-ai/blob/main/gemini/multimodal-live-api/websocket-demo-app/frontend/script.js

export type Device = {
  id: string;
  name: string;
};

const getAvailableDevices = async (deviceType: string): Promise<Device[]> => {
  // 許可を求める
  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

  const allDevices = await navigator.mediaDevices.enumerateDevices();
  return allDevices
    .filter((device) => device.kind === deviceType)
    .map((device) => ({
      id: device.deviceId,
      name: device.label || device.deviceId,
    }));
};

export const getAvailableCameras = () => {
  return getAvailableDevices("videoinput");
};

export const getAvailableAudioInputs = () => {
  return getAvailableDevices("audioinput");
};
