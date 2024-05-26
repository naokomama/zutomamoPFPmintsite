// Package
import { createContext, useState } from 'react';

export type WalletInfo = {
  address: string | null;
  chainId: number | null;
  provider: any;
  setAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
  setProvider: (provider: any) => void;
};

export const WalletContext = createContext<WalletInfo>({
  address: null,
  chainId: null,
  provider: null,
  setAddress: () => {},
  setChainId: () => {},
  setProvider: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState<number | null>(null);

  return (
    <WalletContext.Provider value={{ address, chainId, provider, setAddress, setChainId, setProvider }}>
      {children}
    </WalletContext.Provider>
  );
}
