import { useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const GameHost = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Focus the iframe when component mounts
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <iframe
        ref={iframeRef}
        src={`https://game.a-star.group?room=${roomId}`}
        className="w-full h-full border-0"
        title="Game Host"
        allowFullScreen
        tabIndex={0}
      />
    </div>
  );
};

export default GameHost;
