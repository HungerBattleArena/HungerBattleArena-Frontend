import { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import ConnectRoomSection from "../Section/ConnectRoomSection";
import ViewerItems from "../Section/ViewerItems";

// Infer types from Peer methods to avoid runtime import issues
type DataConnection = ReturnType<Peer["connect"]>;
type MediaConnection = ReturnType<Peer["call"]>;

interface PeerJSConfig {
  host?: string;
  port?: number;
  path?: string;
  secure?: boolean;
}

function ViewGame() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const dataConnectionRef = useRef<DataConnection | null>(null);
  const pendingStreamRef = useRef<MediaStream | null>(null);
  const currentRoomCodeRef = useRef<string | null>(null);

  const handleConnectionChange = (
    connected: boolean,
    roomCode: string | null
  ) => {
    setIsConnected(connected);
    setCurrentRoomCode(roomCode);
    currentRoomCodeRef.current = roomCode;
    if (!connected) {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const handleDataConnectionChange = (
    dataConnection: DataConnection | null
  ) => {
    dataConnectionRef.current = dataConnection;
  };

  const handleSendMessageToGame = (msg: string) => {
    const dataConnection = dataConnectionRef.current;
    if (!dataConnection || !dataConnection.open) {
      console.log("Not connected to game");
      return;
    }

    if (!isConnected) {
      console.log("Not connected to game");
      return;
    }

    console.log("Sending message to game: " + msg);
    // Send spawn command to Unity game
    const spawnCommand = {
      type: msg,
      viewerId: peerId,
      roomCode: currentRoomCode,
      x: null, // null = random position
      y: null, // null = random position
    };

    dataConnection.send(spawnCommand);
  };

  // Initialize PeerJS
  useEffect(() => {
    const windowWithConfig = window as typeof window & {
      PEERJS_CONFIG?: PeerJSConfig;
    };
    const config: PeerJSConfig = windowWithConfig.PEERJS_CONFIG || {
      host: "peer.hedos.finance",
      path: "/",
      secure: true,
    };

    // PeerJS will generate a random ID when null/undefined is passed
    const peer = new Peer(null as unknown as string, config);
    peerRef.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
    });

    peer.on("error", (err) => {
      if (
        err &&
        typeof err === "object" &&
        "type" in err &&
        err.type === "peer-unavailable"
      ) {
        setIsConnected(false);
      }
    });

    // Host will initiate the media call; viewer just answers and shows the stream
    peer.on("call", (call: MediaConnection) => {
      call.answer(undefined); // no local media to send back

      call.on("stream", (remoteStream: MediaStream) => {
        pendingStreamRef.current = remoteStream;
        if (videoRef.current) {
          videoRef.current.srcObject = remoteStream;
        }
      });

      call.on("error", (err) => {
        console.log("Call error: " + err);
      });

      call.on("close", () => {
        console.log("Call closed");
        if (
          videoRef.current &&
          videoRef.current.srcObject === pendingStreamRef.current
        ) {
          videoRef.current.srcObject = null;
        }
      });
    });

    return () => {
      if (dataConnectionRef.current) {
        dataConnectionRef.current.close();
      }
      if (pendingStreamRef.current) {
        pendingStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      peer.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#111] text-[#eee] font-sans relative">
      {/* Room Selector */}
      <ConnectRoomSection
        peerRef={peerRef}
        onConnectionChange={handleConnectionChange}
        onDataConnectionChange={handleDataConnectionChange}
      />

      {/* Video Container */}
      <div className="flex-1 flex items-center justify-center bg-black h-fit w-full mx-auto">
        <video
          ref={videoRef}
          id="remoteVideo"
          autoPlay
          playsInline
          className="w-250 h-150 bg-black"
        />
      </div>

      <ViewerItems onSendMessageToGame={handleSendMessageToGame} />
    </div>
  );
}

export default ViewGame;
