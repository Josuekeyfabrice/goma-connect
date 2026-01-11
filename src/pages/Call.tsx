import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WebRTCSignaling, getRTCConfiguration, type SignalingMessage } from '@/utils/webrtc-signaling';
import type { Profile, Call as CallType } from '@/types/database';

const Call = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const callType = searchParams.get('type') as 'voice' | 'video' || 'voice';
  const incomingCallId = searchParams.get('callId');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [partner, setPartner] = useState<Profile | null>(null);
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [call, setCall] = useState<CallType | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionState, setConnectionState] = useState<string>('new');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const signalingRef = useRef<WebRTCSignaling | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Handle incoming signaling messages
  const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
    const pc = peerConnectionRef.current;
    if (!pc) {
      console.log('No peer connection yet, queuing message');
      return;
    }

    console.log('Handling signaling message:', message.type);

    try {
      if (message.type === 'offer') {
        console.log('Received offer, setting remote description');
        await pc.setRemoteDescription(new RTCSessionDescription(message.payload as RTCSessionDescriptionInit));
        
        // Process pending candidates
        for (const candidate of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current = [];
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await signalingRef.current?.sendAnswer(answer);
        
      } else if (message.type === 'answer') {
        console.log('Received answer, setting remote description');
        await pc.setRemoteDescription(new RTCSessionDescription(message.payload as RTCSessionDescriptionInit));
        
        // Process pending candidates
        for (const candidate of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current = [];
        
      } else if (message.type === 'ice-candidate') {
        console.log('Received ICE candidate');
        const candidate = message.payload as RTCIceCandidateInit;
        
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Queue candidate until remote description is set
          pendingCandidatesRef.current.push(candidate);
        }
      }
    } catch (error) {
      console.error('Error handling signaling message:', error);
    }
  }, []);

  // Initialize WebRTC
  const initWebRTC = useCallback(async (isInitiator: boolean, callId: string) => {
    if (!user || !userId) return;

    console.log('Initializing WebRTC, isInitiator:', isInitiator);

    try {
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection with improved configuration
      const configuration = getRTCConfiguration();
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding track:', track.kind);
        pc.addTrack(track, stream);
      });

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('New ICE candidate:', event.candidate.type);
          signalingRef.current?.sendIceCandidate(event.candidate);
        }
      };

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        setConnectionState(pc.connectionState);
        
        if (pc.connectionState === 'connected') {
          setCallStatus('connected');
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          toast({
            title: "Connexion perdue",
            description: "La connexion avec l'autre utilisateur a été interrompue",
            variant: "destructive",
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
      };

      // Setup signaling
      signalingRef.current = new WebRTCSignaling(
        callId,
        user.id,
        userId,
        handleSignalingMessage
      );
      await signalingRef.current.connect();

      // If initiator, create and send offer
      if (isInitiator) {
        console.log('Creating offer...');
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: callType === 'video',
        });
        await pc.setLocalDescription(offer);
        await signalingRef.current.sendOffer(offer);
      }

    } catch (error) {
      console.error('WebRTC error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la caméra/micro. Vérifiez les permissions.",
        variant: "destructive",
      });
    }
  }, [user, userId, callType, handleSignalingMessage, toast]);

  // Initialize call
  useEffect(() => {
    if (!user || !userId) {
      navigate('/messages');
      return;
    }

    const init = async () => {
      // Load partner profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        setPartner(profileData as Profile);
      }

      // If incoming call, get call details
      if (incomingCallId) {
        const { data: callData } = await supabase
          .from('calls')
          .select('*')
          .eq('id', incomingCallId)
          .single();

        if (callData) {
          setCall(callData as CallType);
          setCallStatus('ringing');
        }
      } else {
        // Create outgoing call
        const { data: callData, error } = await supabase
          .from('calls')
          .insert({
            caller_id: user.id,
            receiver_id: userId,
            status: 'pending',
            call_type: callType,
          })
          .select()
          .single();

        if (error) {
          toast({
            title: "Erreur",
            description: "Impossible d'initier l'appel",
            variant: "destructive",
          });
          navigate('/messages');
          return;
        }

        setCall(callData as CallType);
        setCallStatus('ringing');
        // Initialize WebRTC as initiator
        initWebRTC(true, callData.id);
      }
    };

    init();

    return () => {
      cleanup();
    };
  }, [user, userId, incomingCallId, navigate, toast, initWebRTC, callType]);

  // Subscribe to call status changes
  useEffect(() => {
    if (!call) return;

    const channel = supabase
      .channel(`call-${call.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
          filter: `id=eq.${call.id}`,
        },
        (payload) => {
          const updatedCall = payload.new as CallType;
          setCall(updatedCall);

          if (updatedCall.status === 'accepted') {
            setCallStatus('connected');
          } else if (updatedCall.status === 'rejected' || updatedCall.status === 'ended') {
            setCallStatus('ended');
            setTimeout(() => navigate('/messages'), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [call?.id, navigate]);

  // Call duration timer
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  const cleanup = useCallback(() => {
    // Stop local stream
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    
    // Close peer connection
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    // Disconnect signaling
    signalingRef.current?.disconnect();
    signalingRef.current = null;

    // Clear pending candidates
    pendingCandidatesRef.current = [];
  }, []);

  const acceptCall = async () => {
    if (!call) return;

    // Update call status first
    await supabase
      .from('calls')
      .update({ 
        status: 'accepted',
        started_at: new Date().toISOString(),
      })
      .eq('id', call.id);

    setCallStatus('connected');
    
    // Initialize WebRTC as receiver
    initWebRTC(false, call.id);
  };

  const rejectCall = async () => {
    if (!call) return;

    await supabase
      .from('calls')
      .update({ status: 'rejected' })
      .eq('id', call.id);

    cleanup();
    navigate('/messages');
  };

  const endCall = async () => {
    cleanup();

    // Update call status
    if (call && callStatus !== 'ended') {
      await supabase
        .from('calls')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', call.id);
    }

    navigate('/messages');
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Video Area */}
      {callType === 'video' && callStatus === 'connected' && (
        <div className="flex-1 relative bg-black">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-32 h-24 rounded-lg object-cover border-2 border-background"
          />
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {connectionState}
          </div>
        </div>
      )}

      {/* Voice Call / Connecting UI */}
      {(callType === 'voice' || callStatus !== 'connected') && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Avatar className="h-32 w-32 mb-6">
            <AvatarImage src={partner.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
              {partner.full_name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <h2 className="font-display text-2xl font-bold mb-2">
            {partner.full_name || 'Utilisateur'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {callStatus === 'connecting' && 'Connexion...'}
            {callStatus === 'ringing' && (incomingCallId ? 'Appel entrant...' : 'Appel en cours...')}
            {callStatus === 'connected' && formatDuration(callDuration)}
            {callStatus === 'ended' && 'Appel terminé'}
          </p>

          {callStatus === 'ringing' && (
            <div className="flex items-center justify-center animate-pulse">
              <div className="h-4 w-4 rounded-full bg-primary mr-2" />
              <div className="h-4 w-4 rounded-full bg-primary mr-2 animation-delay-200" />
              <div className="h-4 w-4 rounded-full bg-primary animation-delay-400" />
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="p-8 flex items-center justify-center gap-6 bg-muted/50">
        {/* Incoming call: Accept/Reject */}
        {callStatus === 'ringing' && incomingCallId && (
          <>
            <Button
              variant="destructive"
              size="lg"
              className="h-16 w-16 rounded-full"
              onClick={rejectCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600"
              onClick={acceptCall}
            >
              <Phone className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Connected: Mute, Video toggle, End call */}
        {(callStatus === 'connected' || (callStatus === 'ringing' && !incomingCallId)) && (
          <>
            <Button
              variant={isMuted ? 'destructive' : 'secondary'}
              size="lg"
              className="h-14 w-14 rounded-full"
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {callType === 'video' && (
              <Button
                variant={isVideoEnabled ? 'secondary' : 'destructive'}
                size="lg"
                className="h-14 w-14 rounded-full"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            )}

            <Button
              variant="destructive"
              size="lg"
              className="h-16 w-16 rounded-full"
              onClick={endCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Call;
