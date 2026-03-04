import Peer, { type DataConnection } from 'peerjs';
import { usePeerStore } from '@/store/usePeerStore';

class PeerClientService {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onDataCallback: ((data: any) => void) | null = null;

  // 初始化主机端 (电脑端)
  public initializeHost() {
    const store = usePeerStore.getState();
    // 重新进入连接逻辑前确保先清理旧的 peer
    this.destroy();

    store.setConnectionState('connecting');
    store.setError(null);

    // 随机生成 6 位简单码作为 ID，加上前缀避免冲突
    const randomId = 'ei-' + Math.random().toString(36).substring(2, 8);

    try {
      this.peer = new Peer(randomId, {
        debug: 2,
      });

      this.peer.on('open', (id) => {
        console.log('Host Peer ID is ready: ' + id);
        store.setPeerId(id);
        store.setConnectionState('disconnected'); // Waiting for incoming connections
      });

      this.peer.on('connection', (conn) => {
        // Desktop is host, receives connection from mobile
        this.connection = conn;
        store.setRemotePeerId(conn.peer);
        store.setConnectionState('connected');

        conn.on('data', (data) => {
          if (this.onDataCallback) {
            this.onDataCallback(data);
          }
        });

        conn.on('close', () => {
          store.setConnectionState('disconnected');
          store.setRemotePeerId(null);
          this.connection = null;
        });
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        store.setError(err.message);
      });
      
      this.peer.on('disconnected', () => {
         // Attempt reconnect if possible
         if (this.peer && !this.peer.destroyed) {
             this.peer.reconnect();
         }
      });
      
    } catch (err: any) {
      store.setError(err.message || 'Failed to initialize PeerJS');
    }
  }

  // 初始化移动端 (手机端)
  public connectToHost(hostId: string) {
    const store = usePeerStore.getState();
    // 确保清理旧连接
    this.destroy();

    store.setConnectionState('connecting');
    store.setError(null);
    
    try {
      this.peer = new Peer({ debug: 2 });
      
      this.peer.on('open', () => {
        if (!this.peer) return;
        
        // Connect to the host
        const conn = this.peer.connect(hostId, {
          reliable: true
        });
        
        this.connection = conn;
        
        conn.on('open', () => {
            store.setConnectionState('connected');
            store.setRemotePeerId(hostId);
        });

        conn.on('close', () => {
            store.setConnectionState('disconnected');
            this.connection = null;
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
            store.setError(err.message);
        });
      });
      
      this.peer.on('error', (err) => {
        console.error('Peer error client:', err);
        store.setError(err.message);
      });
      
    } catch (err: any) {
       store.setError(err.message || 'Failed to connect');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public sendData(data: any) {
    if (this.connection && this.connection.open) {
      this.connection.send(data);
      return true;
    }
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setOnDataCallback(callback: (data: any) => void) {
    this.onDataCallback = callback;
  }

  public destroy() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    usePeerStore.getState().reset();
  }
}

export const peerClient = new PeerClientService();
