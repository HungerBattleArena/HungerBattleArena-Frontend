import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, useDisconnectWallet } from '@onelabs/dapp-kit';
import { useState, useRef, useEffect } from 'react';
import { CustomConnectWalletDialog } from '../Dialog/CustomConnectWalletDialog';

export default function MainMenu() {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl pointer-events-auto z-50 fade-in px-4 pt-12">
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        {currentAccount ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="glass-panel px-3 py-2 md:px-6 md:py-3 flex items-center gap-2 md:gap-3 cursor-pointer hover:border-cyan-400/50 transition-all"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm font-tech text-cyan-400">
                {formatAddress(currentAccount.address)}
              </span>
              <svg
                className={`w-4 h-4 text-cyan-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 glass-panel min-w-50 border border-cyan-400/30 shadow-[0_0_30px_rgba(0,243,255,0.3)] rounded-lg overflow-hidden fade-in">
                <div className="p-2">
                  <div className="px-4 py-2 text-xs text-gray-400 border-b border-cyan-400/20 mb-2">
                    <div className="font-tech">Wallet Address</div>
                    <div className="text-cyan-400 mt-1 break-all">{currentAccount.address}</div>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="w-full px-4 py-3 text-left text-sm font-tech text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all flex items-center gap-2 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsWalletDialogOpen(true)}
              className="btn-cyber px-4 py-2 md:px-6 md:py-3 text-sm md:text-lg font-tech uppercase tracking-wider text-white cursor-pointer"
            >
              Connect Wallet
            </button>
            <CustomConnectWalletDialog isOpen={isWalletDialogOpen} onClose={() => setIsWalletDialogOpen(false)} />
          </>
        )}
      </div>

      <h1
        className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-black mb-3 md:mb-4 glitch-text text-center px-4"
        data-text="HUNGER BATTLE"
      >
        HUNGER BATTLE
      </h1>
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 text-center tracking-[0.3em] md:tracking-[0.6em] mb-10 md:mb-14 uppercase px-4">
        Arena Prototype
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-4xl w-full px-6">
        <div
          className="glass-panel p-6 md:p-8 flex flex-col items-center relative mode-card cursor-pointer"
          onClick={() => navigate('/fighter-room')}
        >
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">F</div>
          <h3 className="text-2xl md:text-3xl text-cyan-400">Fighter</h3>
          <p className="text-xs md:text-sm text-gray-400 mt-2">Solo Survival Room</p>
        </div>

        <div
          className="glass-panel p-6 md:p-8 flex flex-col items-center relative mode-card cursor-pointer"
          onClick={() => navigate('/viewer-rooms')}
        >
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">V</div>
          <h3 className="text-2xl md:text-3xl text-pink-500">Viewer Mode</h3>
          <p className="text-xs md:text-sm text-gray-400 mt-2">Bet on Win / Lose</p>
        </div>
      </div>

      <div className="mt-10 md:mt-14 text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 px-4 text-center">
        Solo survival + betting flow
      </div>
    </div>
  );
}
