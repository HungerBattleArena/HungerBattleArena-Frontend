import { useState, useRef, useEffect, useCallback } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router-dom";
import Peer from "peerjs";
import HostLostResultDialog from "../Dialog/HostLostResultDialog";
import HostWinResultDialog from "../Dialog/HostWinResultDialog";
import { useAppSelector } from "../../store/hooks";

// Infer types from Peer methods to avoid runtime import issues
type DataConnection = ReturnType<Peer["connect"]>;

interface PeerJSConfig {
  host?: string;
  port?: number;
  path?: string;
  secure?: boolean;
}

const GameHost = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fighterRoom = useAppSelector((state) => state.game.fighterRoom);
  const gameState = useAppSelector((state) => state.game.gameState);
  const [logs, setLogs] = useState<string[]>([]);

  const [showPlayerDiedDialog, setShowPlayerDiedDialog] = useState(false);
  const [playerName, setPlayerName] = useState<string | undefined>(undefined);
  const [showGameEndedDialog, setShowGameEndedDialog] = useState(false);
  const [winnerName, setWinnerName] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const dataConnectionRef = useRef<DataConnection | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const isConnectingRef = useRef(false);

  const MAX_RETRIES = 5;
  const INITIAL_RETRY_DELAY = 1000; // 1 second
  const MAX_RETRY_DELAY = 10000; // 10 seconds
  const CONNECTION_TIMEOUT = 15000; // 15 seconds

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-49), `[${timestamp}] ${message}`]);
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const windowWithConfig = window as typeof window & {
      PEERJS_CONFIG?: PeerJSConfig;
    };
    const config: PeerJSConfig = windowWithConfig.PEERJS_CONFIG || {
      host: "peer.hedos.finance",
      path: "/",
      secure: true,
    };

    const connectToRoom = (
      peer: Peer,
      hostPeerId: string,
      retryCount: number = 0,
    ) => {
      if (isConnectingRef.current) return;

      if (retryCount >= MAX_RETRIES) {
        console.error(
          `Max retries (${MAX_RETRIES}) reached. Connection failed.`,
        );
        addLog(`Max retries reached while connecting to ${hostPeerId}.`);
        isConnectingRef.current = false;
        return;
      }

      isConnectingRef.current = true;
      addLog(
        `Connecting to ${hostPeerId} (attempt ${retryCount + 1}/${MAX_RETRIES})`,
      );

      if (dataConnectionRef.current) {
        dataConnectionRef.current.close();
        dataConnectionRef.current = null;
      }

      const dataConnection = peer.connect(hostPeerId);
      dataConnectionRef.current = dataConnection;

      const timeoutId = setTimeout(() => {
        if (!dataConnection.open) {
          dataConnection.close();
          isConnectingRef.current = false;

          const delay = Math.min(
            INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
            MAX_RETRY_DELAY,
          );
          retryTimeoutRef.current = setTimeout(() => {
            retryCountRef.current = retryCount + 1;
            connectToRoom(peer, hostPeerId, retryCount + 1);
          }, delay);
        }
      }, CONNECTION_TIMEOUT);

      dataConnection.on("open", () => {
        clearTimeout(timeoutId);
        setIsConnected(true);
        isConnectingRef.current = false;
        retryCountRef.current = 0;
        addLog(`Connected to ${hostPeerId}.`);
      });

      dataConnection.on("error", (err) => {
        clearTimeout(timeoutId);
        console.error("Data connection error:", err);
        setIsConnected(false);
        isConnectingRef.current = false;
        addLog(
          `Connection error with ${hostPeerId}: ${err instanceof Error ? err.message : String(err)
          }`,
        );

        const delay = Math.min(
          INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
          MAX_RETRY_DELAY,
        );
        retryTimeoutRef.current = setTimeout(() => {
          retryCountRef.current = retryCount + 1;
          connectToRoom(peer, hostPeerId, retryCount + 1);
        }, delay);
      });

      dataConnection.on("close", () => {
        clearTimeout(timeoutId);
        setIsConnected(false);
        dataConnectionRef.current = null;
        isConnectingRef.current = false;
        addLog(`Connection to ${hostPeerId} closed.`);
      });
    };

    const peer = new Peer(null as unknown as string, config);
    peerRef.current = peer;

    peer.on("open", () => {
      const hostPeerId = "room-" + roomId;
      retryCountRef.current = 0;
      addLog(`Peer opened. Connecting to ${hostPeerId}.`);
      connectToRoom(peer, hostPeerId, 0);
    });

    peer.on("error", (err) => {
      isConnectingRef.current = false;
      if (
        err &&
        typeof err === "object" &&
        "type" in err &&
        err.type === "peer-unavailable"
      ) {
        setIsConnected(false);
        addLog("Peer unavailable. Waiting for host to come online.");
      } else {
        console.error("PeerJS error:", err);
        addLog(
          `PeerJS error: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    });

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (dataConnectionRef.current) {
        dataConnectionRef.current.close();
        dataConnectionRef.current = null;
      }
      isConnectingRef.current = false;
      retryCountRef.current = 0;
      peer.destroy();
    };
  }, [addLog, roomId]);

  useEffect(() => {
    if (!isConnected) return;

    const dataConnection = dataConnectionRef.current;
    if (!dataConnection || !dataConnection.open) return;

    const handleData = (data: unknown) => {
      try {
        let message: { type?: string; playerName?: string } | null = null;

        if (typeof data === "string") {
          if (data === "player-died" || data === "game-ended") {
            if (data === "player-died") {
              setShowPlayerDiedDialog(true);
              addLog("Received: player-died");
            } else {
              setShowGameEndedDialog(true);
              addLog("Received: game-ended");
            }
            return;
          }

          try {
            message = JSON.parse(data) as {
              type?: string;
              playerName?: string;
            };
          } catch {
            return;
          }
        } else if (typeof data === "object" && data !== null) {
          message = data as { type?: string; playerName?: string };
        } else {
          return;
        }

        if (message?.type === "player-died") {
          setPlayerName(message.playerName);
          setShowPlayerDiedDialog(true);
          addLog(
            `Player died: ${message.playerName ? message.playerName : "Unknown"}`,
          );
        } else if (message?.type === "game-ended") {
          setWinnerName(message.playerName);
          setShowGameEndedDialog(true);
          addLog(
            `Game ended. Winner: ${message.playerName ? message.playerName : "Unknown"
            }`,
          );
        }
      } catch (error) {
        console.error("Error processing message from peer server:", error);
        addLog("Error processing message from peer server.");
      }
    };

    dataConnection.on("data", handleData);

    return () => {
      if (dataConnection) {
        dataConnection.off("data", handleData);
      }
    };
  }, [addLog, isConnected]);

  if (fighterRoom.match_id === null || gameState.role !== "FIGHTER") {
    redirect("/");
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 bg-black/70 text-white p-3 rounded-md max-w-sm max-h-64 overflow-y-auto text-sm space-y-1">
        <div className="font-semibold">Connection Log</div>
        {logs.length === 0 ? (
          <div className="text-gray-300">Waiting for events...</div>
        ) : (
          logs
            .slice()
            .reverse()
            .map((entry, idx) => (
              <div
                key={`${entry}-${idx}`}
                className="whitespace-pre-wrap leading-tight"
              >
                {entry}
              </div>
            ))
        )}
      </div>

      <iframe
        ref={iframeRef}
        src={`https://game.a-star.group?room=${roomId}`}
        // src={`http://localhost:8080?room=${roomId}`}
        className="w-full h-full border-0"
        title="Game Host"
        allowFullScreen
        tabIndex={0}
      />

      <HostLostResultDialog
        isOpen={showPlayerDiedDialog}
        onClose={() => {
          setShowPlayerDiedDialog(false);
          setPlayerName(undefined);
          navigate('/');
        }}
        playerName={playerName}
      />

      <HostWinResultDialog
        isOpen={showGameEndedDialog}
        onClose={() => {
          setShowGameEndedDialog(false);
          setWinnerName(undefined);
          navigate('/');
        }}
        playerName={winnerName}
      />
    </div>
  );
};

export default GameHost;
