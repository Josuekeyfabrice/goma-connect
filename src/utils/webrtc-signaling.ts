import { supabase } from '@/integrations/supabase/client';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-ended';
  payload?: RTCSessionDescriptionInit | RTCIceCandidateInit;
  from: string;
  to: string;
  callId: string;
}

const MAX_CONNECTION_ATTEMPTS = 3;
const CONNECTION_TIMEOUT = 15000;
const RETRY_DELAY = 1000;

export class WebRTCSignaling {
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private callId: string;
  private userId: string;
  private partnerId: string;
  private onMessage: (message: SignalingMessage) => void;
  private isConnected: boolean = false;
  private messageQueue: SignalingMessage[] = [];
  private connectionAttempts: number = 0;

  constructor(
    callId: string, 
    userId: string, 
    partnerId: string,
    onMessage: (message: SignalingMessage) => void
  ) {
    this.callId = callId;
    this.userId = userId;
    this.partnerId = partnerId;
    this.onMessage = onMessage;
  }

  async connect(): Promise<boolean> {
    while (this.connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      this.connectionAttempts++;
      console.log(`Signaling connection attempt ${this.connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}`);
      
      const success = await this.attemptConnection();
      if (success) {
        return true;
      }
      
      if (this.connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await this.sleep(RETRY_DELAY);
      }
    }
    
    console.error('All signaling connection attempts failed');
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async attemptConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      // Cleanup any existing channel first
      if (this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
        this.isConnected = false;
      }

      const channelName = `webrtc-call-${this.callId}`;
      console.log('Connecting to signaling channel:', channelName);
      
      this.channel = supabase.channel(channelName, {
        config: {
          broadcast: { 
            self: false,
            ack: true
          },
          presence: { 
            key: this.userId 
          }
        }
      });

      let resolved = false;
      
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.error('Signaling channel connection timeout');
          this.cleanup();
          resolve(false);
        }
      }, CONNECTION_TIMEOUT);

      this.channel
        .on('broadcast', { event: 'signaling' }, ({ payload }) => {
          const message = payload as SignalingMessage;
          console.log('Received signaling message:', message.type, 'from:', message.from, 'to:', message.to);
          
          // Only process messages meant for us
          if (message.to === this.userId || message.to === '*') {
            this.onMessage(message);
          }
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined signaling channel:', key);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left signaling channel:', key);
        })
        .subscribe(async (status, err) => {
          console.log('Signaling channel status:', status, err ? `Error: ${err}` : '');
          
          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
            
            // Track presence
            await this.channel?.track({ 
              online_at: new Date().toISOString(),
              user_id: this.userId
            });
            
            if (!resolved) {
              resolved = true;
              clearTimeout(timeoutId);
              
              // Flush any queued messages
              this.flushMessageQueue();
              resolve(true);
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Channel error:', err);
            this.isConnected = false;
            if (!resolved) {
              resolved = true;
              clearTimeout(timeoutId);
              this.cleanup();
              resolve(false);
            }
          } else if (status === 'TIMED_OUT') {
            console.error('Channel timed out');
            this.isConnected = false;
            if (!resolved) {
              resolved = true;
              clearTimeout(timeoutId);
              this.cleanup();
              resolve(false);
            }
          } else if (status === 'CLOSED') {
            console.log('Channel closed');
            this.isConnected = false;
          }
        });
    });
  }

  private cleanup() {
    if (this.channel) {
      try {
        supabase.removeChannel(this.channel);
      } catch (e) {
        console.log('Error removing channel:', e);
      }
      this.channel = null;
    }
    this.isConnected = false;
  }

  private async flushMessageQueue() {
    console.log(`Flushing ${this.messageQueue.length} queued messages`);
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.sendMessageInternal(message);
        // Small delay between messages to prevent flooding
        await this.sleep(50);
      }
    }
  }

  private async sendMessageInternal(message: SignalingMessage): Promise<boolean> {
    if (!this.channel) {
      console.warn('No channel available for sending');
      return false;
    }

    try {
      console.log('Sending signaling message:', message.type, 'to:', message.to);
      const result = await this.channel.send({
        type: 'broadcast',
        event: 'signaling',
        payload: message,
      });
      console.log('Message sent, result:', result);
      return result === 'ok';
    } catch (err) {
      console.error('Error sending signaling message:', err);
      return false;
    }
  }

  private async sendMessage(message: SignalingMessage): Promise<boolean> {
    if (!this.isConnected) {
      console.log('Channel not ready, queuing message:', message.type);
      this.messageQueue.push(message);
      return true; // Will be sent when connected
    }

    return this.sendMessageInternal(message);
  }

  async sendOffer(offer: RTCSessionDescriptionInit): Promise<boolean> {
    const message: SignalingMessage = {
      type: 'offer',
      payload: offer,
      from: this.userId,
      to: this.partnerId,
      callId: this.callId,
    };
    
    console.log('Preparing offer for:', this.partnerId);
    return this.sendMessage(message);
  }

  async sendAnswer(answer: RTCSessionDescriptionInit): Promise<boolean> {
    const message: SignalingMessage = {
      type: 'answer',
      payload: answer,
      from: this.userId,
      to: this.partnerId,
      callId: this.callId,
    };
    
    console.log('Preparing answer for:', this.partnerId);
    return this.sendMessage(message);
  }

  async sendIceCandidate(candidate: RTCIceCandidate): Promise<boolean> {
    const message: SignalingMessage = {
      type: 'ice-candidate',
      payload: candidate.toJSON(),
      from: this.userId,
      to: this.partnerId,
      callId: this.callId,
    };
    
    console.log('Sending ICE candidate to:', this.partnerId);
    return this.sendMessage(message);
  }

  async sendCallEnded(): Promise<boolean> {
    const message: SignalingMessage = {
      type: 'call-ended',
      from: this.userId,
      to: this.partnerId,
      callId: this.callId,
    };
    
    console.log('Sending call ended signal');
    return this.sendMessage(message);
  }

  disconnect() {
    console.log('Disconnecting from signaling channel');
    this.cleanup();
    this.messageQueue = [];
    this.connectionAttempts = 0;
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

// WebRTC configuration with reliable STUN/TURN servers
export const getRTCConfiguration = (): RTCConfiguration => ({
  iceServers: [
    // Google STUN servers (most reliable)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Twilio STUN (reliable)
    { urls: 'stun:global.stun.twilio.com:3478' },
    // OpenRelay TURN servers (free, reliable)
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    // Metered TURN servers (backup)
    {
      urls: 'turn:a.relay.metered.ca:80',
      username: 'e8dd65bea4f26e2c01e86cfe',
      credential: 'l3w+hZkr3DYpLxOa',
    },
    {
      urls: 'turn:a.relay.metered.ca:443',
      username: 'e8dd65bea4f26e2c01e86cfe',
      credential: 'l3w+hZkr3DYpLxOa',
    },
    {
      urls: 'turns:a.relay.metered.ca:443?transport=tcp',
      username: 'e8dd65bea4f26e2c01e86cfe',
      credential: 'l3w+hZkr3DYpLxOa',
    },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
});
