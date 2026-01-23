import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Peer from 'peerjs';
import HostLostResultDialog from '../Dialog/HostLostResultDialog';
import HostWinResultDialog from '../Dialog/HostWinResultDialog';
import useCancelMatch from '../../hooks/mutation/match/useCancelMatch';
import { API_URL } from '../../services/constant';
import { API_END_POINTS } from '../../services/api';
import useMatchInfo from '../../hooks/query/useMatchInfo';
import { toast } from 'react-toastify';

// Infer types from Peer methods to avoid runtime import issues
type DataConnection = ReturnType<Peer['connect']>;

interface PeerJSConfig {
  host?: string;
  port?: number;
  path?: string;
  secure?: boolean;
}

const GameHost = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showPlayerDiedDialog, setShowPlayerDiedDialog] = useState(false);
  const [playerName, setPlayerName] = useState<string | undefined>(undefined);
  const [showGameEndedDialog, setShowGameEndedDialog] = useState(false);
  const [winnerName, setWinnerName] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const { mutate: cancelMatch } = useCancelMatch();
  const { data: matchInfo } = useMatchInfo(roomId);
  const navigate = useNavigate();

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
    if (!roomId) return;

    const windowWithConfig = window as typeof window & {
      PEERJS_CONFIG?: PeerJSConfig;
    };
    const config: PeerJSConfig = windowWithConfig.PEERJS_CONFIG || {
      host: 'peer.hedos.finance',
      path: '/',
      secure: true,
    };

    const connectToRoom = (peer: Peer, hostPeerId: string, retryCount: number = 0) => {
      if (isConnectingRef.current) return;

      if (retryCount >= MAX_RETRIES) {
        console.error(`Max retries (${MAX_RETRIES}) reached. Connection failed.`);
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
          dataConnection.close();
          isConnectingRef.current = false;

          const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
          retryTimeoutRef.current = setTimeout(() => {
            retryCountRef.current = retryCount + 1;
            connectToRoom(peer, hostPeerId, retryCount + 1);
          }, delay);
        }
      }, CONNECTION_TIMEOUT);

      dataConnection.on('open', () => {
        clearTimeout(timeoutId);
        setIsConnected(true);
        isConnectingRef.current = false;
        retryCountRef.current = 0;
      });

      dataConnection.on('error', (err) => {
        clearTimeout(timeoutId);
        console.error('Data connection error:', err);
        setIsConnected(false);
        isConnectingRef.current = false;

        const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
        retryTimeoutRef.current = setTimeout(() => {
          retryCountRef.current = retryCount + 1;
          connectToRoom(peer, hostPeerId, retryCount + 1);
        }, delay);
      });

      dataConnection.on('close', () => {
        clearTimeout(timeoutId);
        setIsConnected(false);
        dataConnectionRef.current = null;
        isConnectingRef.current = false;
      });
    };

    const peer = new Peer(null as unknown as string, config);
    peerRef.current = peer;

    peer.on('open', () => {
      const hostPeerId = 'room-' + roomId;
      retryCountRef.current = 0;
      connectToRoom(peer, hostPeerId, 0);
    });

    peer.on('error', (err) => {
      isConnectingRef.current = false;
      if (err && typeof err === 'object' && 'type' in err && err.type === 'peer-unavailable') {
        setIsConnected(false);
      } else {
        console.error('PeerJS error:', err);
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

    const dataConnection = dataConnectionRef.current;
    if (!dataConnection || !dataConnection.open) return;

    const handleData = (data: unknown) => {
      try {
        let message: { type?: string; playerName?: string } | null = null;

        if (typeof data === 'string') {
          if (data === 'player-died' || data === 'game-ended') {
            if (data === 'player-died') {
              setShowPlayerDiedDialog(true);
            } else {
              setShowGameEndedDialog(true);
            }
            return;
          }

          try {
            message = JSON.parse(data) as { type?: string; playerName?: string };
          } catch {
            return;
          }
        } else if (typeof data === 'object' && data !== null) {
          message = data as { type?: string; playerName?: string };
        } else {
          return;
        }

        if (message?.type === 'player-died') {
          setPlayerName(message.playerName);
          setShowPlayerDiedDialog(true);
        } else if (message?.type === 'game-ended') {
          setWinnerName(message.playerName);
          setShowGameEndedDialog(true);
        }
      } catch (error) {
        console.error('Error processing message from peer server:', error);
      }
    };

    dataConnection.on('data', handleData);

    return () => {
      if (dataConnection) {
        dataConnection.off('data', handleData);
      }
    };
  }, [isConnected]);

  // Warn user before closing window or redirecting when room is open
  useEffect(() => {
    if (!isConnected || showGameEndedDialog || showPlayerDiedDialog || !roomId) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return '';
    };

    const handlePageHide = (e: PageTransitionEvent) => {
      // This fires when the page is actually being unloaded (user confirmed)
      if (e.persisted === false && roomId) {
        const url = `${API_URL}${API_END_POINTS.cancelMatch}`;
        const data = JSON.stringify({ matchId: roomId });

        // Try fetch with keepalive first (supports headers, works during unload)
        fetch(url, {
          method: 'POST',
          body: data,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(() => {
          // If fetch fails, try sendBeacon as fallback (guaranteed to send)
          const blob = new Blob([data], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        });

        // Also try the mutation (may not complete during unload but worth trying)
        cancelMatch({ matchId: roomId });
      }
    };

    const handlePopState = () => {
      if (isConnected && roomId) {
        const confirmLeave = window.confirm('You have an open room. Are you sure you want to leave?');
        if (confirmLeave) {
          cancelMatch({ matchId: roomId });
        } else {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    // Push a state to enable popstate detection
    window.history.pushState(null, '', window.location.href);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('popstate', handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, showGameEndedDialog, showPlayerDiedDialog, roomId]);

  useEffect(() => {
    if (
      matchInfo &&
      (matchInfo?.status === 'ended' || matchInfo?.status === 'cancelled') &&
      !showGameEndedDialog &&
      !showPlayerDiedDialog
    ) {
      toast.info('Match has ended or been cancelled. Redirecting to home page.');
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchInfo, navigate]);

  // if (!matchInfo) {
  //   return (
  //     <div className="w-screen h-screen max-w-7xl p-4 flex flex-col items-center justify-center py-24">
  //       <div className="relative">
  //         <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
  //         <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/20 rounded-full animate-pulse"></div>
  //       </div>
  //       <div className="mt-6 text-cyan-400 font-bold uppercase tracking-wider animate-pulse">Loading Rooms...</div>
  //     </div>
  //   );
  // }

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <iframe
        ref={iframeRef}
        src={`https://game.a-star.group?room=${roomId}`}
        // src={`http://localhost:53050?room=${roomId}`}
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
