/* eslint-disable @typescript-eslint/no-explicit-any */
import { useConnectWallet, useWallets } from '@onelabs/dapp-kit';
import type { WalletWithRequiredFeatures } from '@onelabs/wallet-standard';
import { useState } from 'react';
import { APP_URL, ONE_WALLET_URL } from '../../constants';

interface CustomConnectWalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomConnectWalletDialog({ isOpen, onClose }: CustomConnectWalletDialogProps) {
  const wallets = useWallets();
  const oneWallet = wallets.find((wallet) => wallet.name === 'OneWallet');
  const { mutate: connectWallet, isPending, isError } = useConnectWallet();
  const [selectedWallet, setSelectedWallet] = useState<WalletWithRequiredFeatures | null>(null);

  const handleConnect = (wallet: WalletWithRequiredFeatures) => {
    setSelectedWallet(wallet);
    connectWallet(
      { wallet },
      {
        onSuccess: () => {
          onClose();
          setSelectedWallet(null);
        },
        onError: () => {
          // Error is handled by isError state
        },
      }
    );
  };

  const textRedirection = (!(window as any).Telegram && !oneWallet) ? 'Install One Wallet' : 'Continue on browser';

  const handleContinueOnBrowser = () => {
    if ((window as any).Telegram) {
      (window as any).Telegram.WebApp.openLink(APP_URL);
    } else {
      window.open(ONE_WALLET_URL, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-10 glass-panel max-w-md w-full mx-4 p-8 rounded-lg border-2 border-cyan-400/30 shadow-[0_0_40px_rgba(0,243,255,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-cyan-400/20">
          <h2 className="text-3xl font-tech text-cyan-400 uppercase tracking-wider text-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyan-400 transition-all text-3xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-cyan-400/10"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Wallet List */}
        <div className="space-y-3 mb-6">
          {!oneWallet ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No wallets detected</p>
              <p className="text-sm text-gray-500">Please install a One Wallet wallet extension</p>
              <button onClick={handleContinueOnBrowser} className='mt-4 btn-cyber px-4 py-2 md:px-6 md:py-3 text-sm md:text-lg font-tech uppercase tracking-wider text-white cursor-pointer'>{textRedirection}</button>
            </div>
          ) : (
            [oneWallet].map((wallet) => {
              const isConnecting = isPending && selectedWallet?.name === wallet.name;
              const walletName = wallet.name || 'Unknown Wallet';
              const walletIcon = wallet.icon;

              return (
                <button
                  key={wallet.name}
                  onClick={() => handleConnect(wallet)}
                  disabled={isPending}
                  className={`
                    w-full glass-panel p-4 flex items-center gap-4
                    transition-all duration-300 cursor-pointer
                    hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:transform hover:scale-[1.02]
                    ${isConnecting ? 'border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,243,255,0.5)]' : 'border border-white/15'}
                    ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {walletIcon && <img src={walletIcon} alt={walletName} className="w-10 h-10 rounded" />}
                  <div className="flex-1 text-left">
                    <div className="text-lg font-tech text-white">{walletName}</div>
                    {isConnecting && <div className="text-sm text-cyan-400 mt-1">Connecting...</div>}
                  </div>
                  {isConnecting && (
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Error Message */}
        {isError && selectedWallet && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm font-tech">
            <span className="text-red-500">⚠</span> Failed to connect. Please try again.
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
