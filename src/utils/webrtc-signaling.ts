import { supabase } from '@/integrations/supabase/client';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
  from: string;
  to: string;
  callId: string;
}

export class WebRTCSignaling {
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private callId: string;
  private userId: string;
  private partnerId: string;
  private onMessage: (message: SignalingMessage) => void;
  private isConnected: boolean = false;
  private messageQueue: SignalingMessage[] = [];

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
    return new Promise((resolve) => {
      const channelName = `webrtc-signaling-${this.callId}`;
      console.log('Connecting to signaling channel:', channelName);
      
      this.channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: this.userId }
        }
      });

      this.channel
        .on('broadcast', { event: 'signaling' }, ({ payload }) => {
          const message = payload as SignalingMessage;
          console.log('Received signaling message:', message.type, 'from:', message.from);
          
          // Only process messages meant for us
          if (message.to === this.userId) {
            this.onMessage(message);
          }
        })
        .subscribe((status) => {
          console.log('Signaling channel status:', status);
          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
            // Flush any queued messages
            this.flushMessageQueue();
            resolve(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.isConnected = false;
            resolve(false);
          }
        });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isConnected) {
          console.error('Signaling channel connection timeout');
          resolve(false);
        }
      }, 10000);
    });
  }

  private async flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.sendMessage(message);
      }
    }
  }

  private async sendMessage(message: SignalingMessage) {
    if (!this.channel) {
      console.warn('No channel available');
      return;
    }

    if (!this.isConnected) {
      console.log('Channel not ready, queuing message:', message.type);
      this.messageQueue.push(message);
      return;
    }

    try {
      console.log('Sending signaling message:', message.type, 'to:', message.to);
      await this.channel.send({
        type: 'broadcast',
        event: 'signaling',
        payload: message,
      });
    } catch (err) {
      console.error('Error sending signaling message:', err);
    }
  }

  async sendOffer(offer: RTCSessionDescriptionInit) {
    const message: SignalingMessage = {
      type: 'offer',
      payload: offer,
      from: this.userId,
      to: this.partnerId,
      callId: this.callId,
    };
    
    console.log('Preparing offer for:', this.partnerId);
    await this.sendMessage(message);
  }

  async sendAnswer(answer: RTCSessionDescriptionInit) {
    const message: SignalingMessage = {
      type: 'answer',
      payload: answer,
      from: this.userId,
      to: this.partnerId,
      callId: this.callId,
    };
    
    console.log('Preparing answer for:', this.partnerId);
    await this.sendMessage(message);
  }

  async sendIceCandidate(candidate: RTCIceCandidate) {
    const message: SignalingMessage = {
      type: 'ice-candidate',
      payload: candidate.toJSON(),
      from: this.userId,
      to: this.partnerId,
      callId: this.callId,
    };
    
    console.log('Sending ICE candidate to:', this.partnerId);
    await this.sendMessage(message);
  }

  disconnect() {
    if (this.channel) {
      console.log('Disconnecting from signaling channel');
      this.isConnected = false;
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  get connected() {
    return this.isConnected;
  }
}

// WebRTC configuration with reliable STUN/TURN servers
export const getRTCConfiguration = (): RTCConfiguration => ({
  iceServers: [
    // Google STUN servers (reliable)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // Twilio STUN (reliable)
    { urls: 'stun:global.stun.twilio.com:3478' },
    // Metered TURN servers (free tier - more reliable)
    {
      urls: 'turn:a.relay.metered.ca:80',
      username: 'e8dd65bea4f26e2c01e86cfe',
      credential: 'l3w+hZkr3DYpLxOa',
    },
    {
      urls: 'turn:a.relay.metered.ca:80?transport=tcp',
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
