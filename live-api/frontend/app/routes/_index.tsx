import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { LiveAudioOutputManager } from "../liveMediaManager";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [query, setQuery] = useState("")

  const onSend = () => {
    const manager = new LiveAudioOutputManager()

    const websocket = new WebSocket("ws://localhost:8765")
    websocket.onopen = () => {
      websocket.send(query)
    }
    websocket.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        manager.playAudioChunk(await event.data.arrayBuffer())
      }
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <div>
          <div>
            <label htmlFor="message">メッセージ</label>
          </div>
          <div>
            <textarea
              id="message"
              rows={4}
              cols={50}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                padding: "0.5rem",
                border: "1px solid #ccc",
                outline: "none",
                boxShadow: "none",
              }}
            >
              {query}
            </textarea>
          </div>
          <div>
            <button
              type="button"
              onClick={onSend}
              style={{
                border: "1px solid #ccc",
                padding: "0.5rem 1rem",
              }}
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
