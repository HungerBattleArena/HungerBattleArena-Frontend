import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import HostLostResultDialog from "../Dialog/HostLostResultDialog";
import HostWinResultDialog from "../Dialog/HostWinResultDialog";

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

  const [showPlayerDiedDialog, setShowPlayerDiedDialog] = useState(false);
  const [playerName, setPlayerName] = useState<string | undefined>(undefined);
  const [showGameEndedDialog, setShowGameEndedDialog] = useState(false);
  const [winnerName, setWinnerName] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  const log = (...args: unknown[]) => console.log("[GameHost]", ...args);

  const peerRef = useRef<Peer | null>(null);
  const dataConnectionRef = useRef<DataConnection | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const isConnectingRef = useRef(false);

  const MAX_RETRIES = 5;
  const INITIAL_RETRY_DELAY = 1000; // 1 second
  const MAX_RETRY_DELAY = 10000; // 10 seconds
  const CONNECTION_TIMEOUT = 15000; // 15 seconds

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;
    if (dataConnectionRef.current) return;
    log("init peer connection", { roomId });

    const config: PeerJSConfig = {
      host: "peer.hedos.finance",
      path: "/",
      secure: true,
    };

    const connectToRoom = (
      peer: Peer,
      hostPeerId: string,
      retryCount: number = 0,
    ) => {
      log("connectToRoom start", { hostPeerId, retryCount });
      if (isConnectingRef.current) return;

      if (retryCount >= MAX_RETRIES) {
        console.error(
          `Max retries (${MAX_RETRIES}) reached. Connection failed.`,
        );
        isConnectingRef.current = false;
        return;
      }

      isConnectingRef.current = true;

      if (dataConnectionRef.current) {
        dataConnectionRef.current.close();
        dataConnectionRef.current = null;
      }

      const dataConnection = peer.connect(hostPeerId);
      dataConnectionRef.current = dataConnection;

      const timeoutId = setTimeout(() => {
        if (!dataConnection.open) {
          log("connection timeout, closing and scheduling retry", {
            retryCount,
          });
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
        log("dataConnection open");
        setIsConnected(true);
        isConnectingRef.current = false;
        retryCountRef.current = 0;
      });

      dataConnection.on("error", (err) => {
        clearTimeout(timeoutId);
        console.error("Data connection error:", err);
        log("dataConnection error", err);
        setIsConnected(false);
        isConnectingRef.current = false;

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
        log("dataConnection close");
        setIsConnected(false);
        dataConnectionRef.current = null;
        isConnectingRef.current = false;
      });
    };

    const peer = new Peer(null as unknown as string, config);
    peerRef.current = peer;

    peer.on("open", () => {
      log("peer open");
      const hostPeerId = "room-" + roomId;
      retryCountRef.current = 0;
      connectToRoom(peer, hostPeerId, 0);
    });

    peer.on("error", (err) => {
      log("peer error", err);
      isConnectingRef.current = false;
      if (
        err &&
        typeof err === "object" &&
        "type" in err &&
        err.type === "peer-unavailable"
      ) {
        setIsConnected(false);
      } else {
        console.error("PeerJS error:", err);
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
  }, [roomId]);

  useEffect(() => {
    if (!isConnected) return;
    log("data listener setup - isConnected true");

    const dataConnection = dataConnectionRef.current;
    if (!dataConnection || !dataConnection.open) return;

    const handleData = (data: unknown) => {
      log("data received raw", data);
      try {
        let message: { type?: string; playerName?: string } | null = null;
        if (typeof data === "string") {
          if (data === "player-died" || data === "game-ended") {
            if (data === "player-died") {
              log("parsed event player-died");
              setShowPlayerDiedDialog(true);
            } else {
              log("parsed event game-ended");
              setShowGameEndedDialog(true);
            }
            return;
          }

          try {
            message = JSON.parse(data) as {
              type?: string;
              playerName?: string;
            };
          } catch {
            log("failed to parse string JSON");
            return;
          }
        } else if (typeof data === "object" && data !== null) {
          message = data as { type?: string; playerName?: string };
        } else {
          log("unknown data type, ignoring");
          return;
        }

        if (message?.type === "player-died") {
          log("parsed message player-died", message.playerName);
          setPlayerName(message.playerName);
          setShowPlayerDiedDialog(true);
        } else if (message?.type === "game-ended") {
          log("parsed message game-ended", message.playerName);
          setWinnerName(message.playerName);
          setShowGameEndedDialog(true);
        }
      } catch (error) {
        console.error("Error processing message from peer server:", error);
        log("handleData error", error);
      }
    };

    dataConnection.on("data", handleData);

    return () => {
      if (dataConnection) {
        log("data listener cleanup");
        dataConnection.off("data", handleData);
      }
    };
  }, [isConnected]);

  useEffect(() => {
    if (fighterRoom.match_id === null || gameState.role !== "FIGHTER") {
      navigate("/");
    }
  }, [fighterRoom.match_id, gameState.role, navigate]);

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <iframe
        ref={iframeRef}
        src={`https://game.a-star.group?room=${roomId}`}
        // src={`http://localhost:61244?room=${roomId}`}
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
