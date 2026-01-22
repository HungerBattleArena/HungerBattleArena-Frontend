import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import ConnectRoomSection from '../Section/ConnectRoomSection';
import ViewerItems from '../Section/ViewerItems';
import { useAppSelector } from '../../store/hooks';
import RefundDialog from '../Dialog/RefundDialog';
import ViewerResults from './ViewerResults';
import { toast } from 'react-toastify';

// Infer types from Peer methods to avoid runtime import issues
type DataConnection = ReturnType<Peer['connect']>;
type MediaConnection = ReturnType<Peer['call']>;

interface PeerJSConfig {
  host?: string;
  port?: number;
  path?: string;
  secure?: boolean;
}

function ViewGame() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isShowResultDialog, setIsShowResultDialog] = useState(false);
  const [viewerWon, setViewerWon] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const dataConnectionRef = useRef<DataConnection | null>(null);
  const pendingStreamRef = useRef<MediaStream | null>(null);
  const currentRoomCodeRef = useRef<string | null>(null);

  const gameState = useAppSelector((state) => state.game.gameState);
  const selectedRoom = useAppSelector((state) => state.game.selectedRoom);

  const viewerBetSide = gameState.faction;

  const handleConnectionChange = (connected: boolean, roomCode: string | null) => {
    setIsConnected(connected);
    setCurrentRoomCode(roomCode);
    currentRoomCodeRef.current = roomCode;
    if (!connected) {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const handleDataConnectionChange = (dataConnection: DataConnection | null) => {
    dataConnectionRef.current = dataConnection;
  };

  const handleSendMessageToGame = (msg: string) => {
    const dataConnection = dataConnectionRef.current;
    if (!dataConnection || !dataConnection.open) {
      console.log('Not connected to game');
      return;
    }

    if (!isConnected) {
      console.log('Not connected to game');
      return;
    }

    const command = {
      type: msg,
      viewerId: peerId,
      roomCode: currentRoomCode,
    };

    dataConnection.send(command);
  };

  // Initialize PeerJS
  useEffect(() => {
    const config: PeerJSConfig = {
      host: 'peer.hedos.finance',
      path: '/',
      secure: true,
    };

    const peer = new Peer(null as unknown as string, config);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('error', (err) => {
      console.log('aaaaa');
      if (err && typeof err === 'object' && 'type' in err && err.type === 'peer-unavailable') {
        setIsConnected(false);
      }
    });

    // Host will initiate the media call; viewer just answers and shows the stream
    peer.on('call', (call: MediaConnection) => {
      call.answer(undefined); // no local media to send back

      call.on('stream', (remoteStream: MediaStream) => {
        pendingStreamRef.current = remoteStream;
        if (videoRef.current) {
          videoRef.current.srcObject = remoteStream;
        }
      });

      call.on('error', (err) => {
        console.log('Call error: ' + err);
        toast.error('Call error: ' + err);
      });

      call.on('close', () => {
        console.log('Call closed');
        toast.error('Call closed');
        if (videoRef.current && videoRef.current.srcObject === pendingStreamRef.current) {
          videoRef.current.srcObject = null;
          setIsRefundDialogOpen(true);
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

  // Listen for messages from peer server
  useEffect(() => {
    if (!isConnected) return;

    const dataConnection = dataConnectionRef.current;
    if (!dataConnection) return;

    const handleData = (data: unknown) => {
      try {
        console.log('🚀 ~ data:', data);

        if (data === 'player-died') {
          if (viewerBetSide == 'WIN') {
            setIsShowResultDialog(true);
            setViewerWon(false);
          } else if (viewerBetSide == 'LOSE') {
            setIsShowResultDialog(true);
            setViewerWon(true);
          }
        } else if (data === 'game-ended') {
          if (viewerBetSide == 'LOSE') {
            setIsShowResultDialog(true);
            setViewerWon(false);
          } else if (viewerBetSide == 'WIN') {
            setIsShowResultDialog(true);
            setViewerWon(true);
          }
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
  }, [isConnected, viewerBetSide]);

  console.log('🚀 ~ isShowResultDialog:', isShowResultDialog);
  console.log('🚀 ~ viewerWon:', viewerWon);
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
        <video ref={videoRef} id="remoteVideo" autoPlay playsInline className="w-250 h-150 bg-black" />
      </div>

      <ViewerItems onSendMessageToGame={handleSendMessageToGame} />

      <ViewerResults isOpen={isShowResultDialog} victory={viewerWon} />

      <RefundDialog
        isOpen={isRefundDialogOpen}
        onClose={() => setIsRefundDialogOpen(false)}
        yourSide={gameState.faction}
        yourBet={gameState.userBetAmount}
        roomName={selectedRoom?.name}
        matchId=""
        roomPool={selectedRoom?.total_pool}
      />
    </div>
  );
}

export default ViewGame;
