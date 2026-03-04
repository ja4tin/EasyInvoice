import { create } from 'zustand';

export type PeerConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface PeerState {
  peerId: string | null;
  connectionState: PeerConnectionState;
  remotePeerId: string | null;
  error: string | null;
  isReceiving: boolean;
  
  setPeerId: (id: string | null) => void;
  setConnectionState: (state: PeerConnectionState) => void;
  setRemotePeerId: (id: string | null) => void;
  setError: (error: string | null) => void;
  setIsReceiving: (isReceiving: boolean) => void;
  reset: () => void;
}

export const usePeerStore = create<PeerState>((set) => ({
  peerId: null,
  connectionState: 'disconnected',
  remotePeerId: null,
  error: null,
  isReceiving: false,

  setPeerId: (id) => set({ peerId: id }),
  setConnectionState: (state) => set({ connectionState: state }),
  setRemotePeerId: (id) => set({ remotePeerId: id }),
  setError: (error) => set({ error, connectionState: 'error' }),
  setIsReceiving: (isReceiving) => set({ isReceiving }),
  reset: () => set({ 
    peerId: null, 
    connectionState: 'disconnected', 
    remotePeerId: null, 
    error: null,
    isReceiving: false
  })
}));
