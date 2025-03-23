import type { MetaFunction } from "@remix-run/node";
import { useEffect, useRef, useState } from "react";
import { LiveAudioInputManager, LiveAudioOutputManager } from "../liveMediaManager";
import { type Device, getAvailableAudioInputs } from "../device";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const audioInputManagerRef = useRef<LiveAudioInputManager>()
  const audioOutputManagerRef = useRef<LiveAudioOutputManager>()
  useEffect(() => {
    // クライアントサイドでの初期化が必要
    audioInputManagerRef.current = new LiveAudioInputManager()
    audioOutputManagerRef.current = new LiveAudioOutputManager()
  }, [])

  const [devices, setDevices] = useState<Device[]>([]);
  useEffect(() => {
    // クライアントサイドでの初期化が必要
    getAvailableAudioInputs().then(setDevices);
  }, [])

  const [selectedMic, setSelectedMic] = useState<string>("")
  const newMicSelected = (deviceId: string) => {
    setSelectedMic(deviceId)
    audioInputManagerRef.current?.updateMicrophoneDevice(deviceId)
  }

  const [isChatting, setIsChatting] = useState(false)
  const websocketRef = useRef<WebSocket>()
  const startAudioInput = () => {
    setIsChatting(true)

    websocketRef.current = new WebSocket("ws://localhost:8765")
    websocketRef.current.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        audioOutputManagerRef.current?.playAudioChunk(await event.data.arrayBuffer())
      }
    }

    if (audioInputManagerRef.current) {
      audioInputManagerRef.current.onNewAudioRecordingChunk = (audioData: string) => {
        websocketRef.current?.send(audioData)
      }
      audioInputManagerRef.current?.connectMicrophone();
    }
  }
  const stopAudioInput = () => {
    setIsChatting(false)
    audioInputManagerRef.current?.disconnectMicrophone();
    websocketRef.current?.send("exit")
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <div>
          <div>
            <label htmlFor="mic">マイクを選択</label>
          </div>
          <div>
            <select
              id="mic"
              value={selectedMic}
              onChange={(e) => newMicSelected(e.target.value)}
              style={{
                padding: "0.5rem",
                border: "1px solid #ccc",
                outline: "none",
                boxShadow: "none",
              }}
            >
              <option value="">選択してください</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>
        </div>
        {selectedMic && (
          <div>
            <button
              type="button"
              onClick={isChatting ? stopAudioInput : startAudioInput}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #ccc",
              }}
            >
              {isChatting ? "会話終了" : "会話開始"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
