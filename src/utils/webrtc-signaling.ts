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

  async connect() {
    const channelName = `webrtc-signaling-${this.callId}`;
    console.log('Connecting to signaling channel:', channelName);
    
    this.channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false }
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
      });
  }

  async sendOffer(offer: RTCSessionDescriptionInit) {
    if (!this.channel) return;
    
    const message: SignalingMessage = {
      type: 'offer',
      payload: offer,
      from: this.userId,
      to: this.partnerId,
      callId: this.callId,
    };
    
    console.log('Sending offer to:', this.partnerId);
    await this.channel.send({
      type: 'broadcast',
      event: 'signaling',
      payload: message,
    });
  }

  async sendAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.channel) return;
    
    const message: SignalingMessage = {
      type: 'answer',
      payload: answer,
      from: this.userId,
      to: this.partnerId,
      callId: this.callId,
    };
    
    console.log('Sending answer to:', this.partnerId);
    await this.channel.send({
      type: 'broadcast',
      event: 'signaling',
      payload: message,
    });
  }

  async sendIceCandidate(candidate: RTCIceCandidate) {
    if (!this.channel) return;
    
    const message: SignalingMessage = {
      type: 'ice-candidate',
      payload: candidate.toJSON(),
      from: this.userId,
      to: this.partnerId,
      callId: this.callId,
    };
    
    console.log('Sending ICE candidate to:', this.partnerId);
    await this.channel.send({
      type: 'broadcast',
      event: 'signaling',
      payload: message,
    });
  }

  disconnect() {
    if (this.channel) {
      console.log('Disconnecting from signaling channel');
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

// WebRTC configuration with multiple STUN/TURN servers for better connectivity
export const getRTCConfiguration = (): RTCConfiguration => ({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
});
