import Peer from "peerjs";
import { useState, useRef, useEffect } from "react";

type DataConnection = ReturnType<Peer["connect"]>;
interface ConnectRoomSectionProps {
  peerRef: React.MutableRefObject<Peer | null>;
  onConnectionChange: (isConnected: boolean, roomCode: string | null) => void;
  onDataConnectionChange: (dataConnection: DataConnection | null) => void;
}

const ConnectRoomSection = ({
  peerRef,
  onConnectionChange,
  onDataConnectionChange,
}: ConnectRoomSectionProps) => {
  // Initialize room code from URL if present
  const getInitialRoomCode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room");
    return roomParam && roomParam.trim() !== ""
      ? roomParam.trim().toUpperCase()
      : "";
  };

  const [roomCode, setRoomCode] = useState(getInitialRoomCode);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const dataConnectionRef = useRef<DataConnection | null>(null);
  const currentRoomCodeRef = useRef<string | null>(null);
  const autoConnectAttemptedRef = useRef(false);

  const connectToRoom = (code: string) => {
    if (!code || code.length !== 6) {
      console.log(
        "Invalid room code. Please enter a 6-character code (e.g., ABC123)"
      );
      return;
    }

    const peer = peerRef.current;
    if (!peer || !peer.id) {
      console.log("PeerJS not ready yet. Please wait...");
      return;
    }

    if (isConnected) {
      console.log("Already connected to a room. Disconnect first.");
      return;
    }

    setCurrentRoomCode(code);
    currentRoomCodeRef.current = code;
    const hostPeerId = "room-" + code;

    console.log(`Connecting to room: ${code} (peer ID: ${hostPeerId})...`);
    setIsConnected(false);

    // Close existing connection if any
    if (dataConnectionRef.current) {
      dataConnectionRef.current.close();
      dataConnectionRef.current = null;
    }

    // Open data connection to host
    const dataConnection = peer.connect(hostPeerId);
    dataConnectionRef.current = dataConnection;

    dataConnection.on("open", () => {
      console.log(`Connected to room ${code}`);
      setIsConnected(true);

      // Send a small message so host knows this viewer is ready
      // dataConnection.send({
      //   type: "viewer-hello",
      //   viewerId: peer.id,
      //   roomCode: code,
      // });
    });

    dataConnection.on("error", (err) => {
      console.log("Data connection error: " + err);
      setIsConnected(false);
    });

    dataConnection.on("close", () => {
      setIsConnected(false);
      onDataConnectionChange(null);
    });
  };

  const disconnectFromRoom = () => {
    if (dataConnectionRef.current) {
      dataConnectionRef.current.close();
      dataConnectionRef.current = null;
    }

    setIsConnected(false);
    setCurrentRoomCode(null);
    currentRoomCodeRef.current = null;
    onDataConnectionChange(null);
  };

  const handleConnect = () => {
    const code = roomCode.trim().toUpperCase();
    if (code) {
      connectToRoom(code);
    } else {
      console.log("Please enter a room code");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isConnected) {
      handleConnect();
    }
  };

  // Auto-connect on mount if room code is present in URL
  useEffect(() => {
    if (autoConnectAttemptedRef.current) {
      return; // Already attempted auto-connect
    }

    const initialRoomCode = getInitialRoomCode();
    if (!initialRoomCode || initialRoomCode.length !== 6) {
      return; // No valid room code in URL
    }

    if (isConnected) {
      return; // Already connected
    }

    autoConnectAttemptedRef.current = true;

    // Check if peer is ready, if not, retry after a short delay (max 10 attempts)
    let retryCount = 0;
    const maxRetries = 10;

    const tryAutoConnect = () => {
      const peer = peerRef.current;
      if (peer && peer.id) {
        connectToRoom(initialRoomCode);
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(tryAutoConnect, 200);
      } else {
        console.log("Auto-connect: Peer not ready after multiple attempts");
        autoConnectAttemptedRef.current = false; // Allow retry later
      }
    };

    // Start trying to connect after a small delay to ensure component is fully mounted
    const timeoutId = setTimeout(tryAutoConnect, 100);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - intentionally exclude dependencies

  // Notify parent when connection status changes
  useEffect(() => {
    onConnectionChange(isConnected, currentRoomCode);
    onDataConnectionChange(dataConnectionRef.current);
  }, [
    isConnected,
    currentRoomCode,
    onConnectionChange,
    onDataConnectionChange,
  ]);

  return (
    <div className="p-3 bg-[#222] border-b border-[#333] flex gap-2 items-center flex-wrap">
      <label htmlFor="roomCodeInput" className="text-sm font-bold">
        Room Code:
      </label>
      <input
        type="text"
        id="roomCodeInput"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        onKeyPress={handleKeyPress}
        placeholder="ABC123"
        maxLength={6}
        disabled={isConnected}
        className="px-2.5 py-1.5 border border-[#444] rounded bg-[#333] text-sm w-30 uppercase focus:outline-none focus:border-[#3a7bfd] disabled:opacity-50"
      />
      {!isConnected ? (
        <button
          id="connectBtn"
          onClick={handleConnect}
          className="px-3 py-1.5 bg-[#27ae60] text-black border-none rounded cursor-pointer text-sm hover:bg-[#229954] disabled:opacity-50 disabled:cursor-default"
        >
          Connect
        </button>
      ) : (
        <button
          id="disconnectBtn"
          onClick={disconnectFromRoom}
          className="px-3 py-1.5 bg-[#e67e22] border-none rounded cursor-pointer text-sm hover:bg-[#d35400] disabled:opacity-50 disabled:cursor-default"
        >
          Disconnect
        </button>
      )}
      <div
        className={`ml-auto text-xs ${
          isConnected ? "text-[#27ae60]" : "text-[#999]"
        }`}
      >
        {isConnected
          ? `Connected to room: ${currentRoomCode}`
          : "Not connected"}
      </div>
    </div>
  );
};

export default ConnectRoomSection;
