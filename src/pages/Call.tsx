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
  const [isWebRTCReady, setIsWebRTCReady] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const signalingRef = useRef<WebRTCSignaling | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const hasCreatedOfferRef = useRef(false);

  // Handle incoming signaling messages
  const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
    const pc = peerConnectionRef.current;
    if (!pc) {
      console.log('No peer connection yet, queuing message');
      if (message.type === 'ice-candidate') {
        pendingCandidatesRef.current.push(message.payload as RTCIceCandidateInit);
      }
      return;
    }

    console.log('Handling signaling message:', message.type, 'PC state:', pc.signalingState);

    try {
      if (message.type === 'offer') {
        console.log('Received offer, current signaling state:', pc.signalingState);
        
        if (pc.signalingState !== 'stable') {
          console.log('Not in stable state, waiting...');
          return;
        }
        
        await pc.setRemoteDescription(new RTCSessionDescription(message.payload as RTCSessionDescriptionInit));
        console.log('Remote description set, creating answer...');
        
        // Process pending candidates after setting remote description
        for (const candidate of pendingCandidatesRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('Added pending ICE candidate');
          } catch (e) {
            console.error('Error adding pending ICE candidate:', e);
          }
        }
        pendingCandidatesRef.current = [];
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('Answer created and set as local description');
        await signalingRef.current?.sendAnswer(answer);
        
      } else if (message.type === 'answer') {
        console.log('Received answer, current signaling state:', pc.signalingState);
        
        if (pc.signalingState !== 'have-local-offer') {
          console.log('Not in have-local-offer state, ignoring answer');
          return;
        }
        
        await pc.setRemoteDescription(new RTCSessionDescription(message.payload as RTCSessionDescriptionInit));
        console.log('Answer set as remote description');
        
        // Process pending candidates after setting remote description
        for (const candidate of pendingCandidatesRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('Added pending ICE candidate');
          } catch (e) {
            console.error('Error adding pending ICE candidate:', e);
          }
        }
        pendingCandidatesRef.current = [];
        
      } else if (message.type === 'ice-candidate') {
        console.log('Received ICE candidate');
        const candidate = message.payload as RTCIceCandidateInit;
        
        if (pc.remoteDescription && pc.remoteDescription.type) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('ICE candidate added successfully');
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        } else {
          console.log('Queuing ICE candidate, remote description not set yet');
          pendingCandidatesRef.current.push(candidate);
        }
      }
    } catch (error) {
      console.error('Error handling signaling message:', error);
    }
  }, []);

  // Initialize WebRTC
  const initWebRTC = useCallback(async (isInitiator: boolean, callId: string) => {
    if (!user || !userId) {
      console.error('Missing user or userId');
      return;
    }
    
    if (peerConnectionRef.current) {
      console.log('WebRTC already initialized');
      return;
    }

    console.log('Initializing WebRTC, isInitiator:', isInitiator, 'callId:', callId);

    try {
      // Get media stream
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: callType === 'video' ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        } : false,
      };

      console.log('Requesting media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got local stream with tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));

      localStreamRef.current = stream;
      
      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
      }

      // Create peer connection with improved configuration
      const configuration = getRTCConfiguration();
      console.log('Creating peer connection with config:', configuration);
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      // Create remote stream
      remoteStreamRef.current = new MediaStream();

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding local track to PC:', track.kind, track.label);
        pc.addTrack(track, stream);
      });

      // Handle incoming tracks - CRITICAL for audio
      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind, 'streams:', event.streams.length);
        
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];
          
          if (event.track.kind === 'video' && remoteVideoRef.current) {
            console.log('Setting remote video stream');
            remoteVideoRef.current.srcObject = remoteStream;
          }
          
          if (event.track.kind === 'audio' && remoteAudioRef.current) {
            console.log('Setting remote audio stream');
            remoteAudioRef.current.srcObject = remoteStream;
            // Ensure audio plays
            remoteAudioRef.current.play().catch(e => {
              console.log('Auto-play prevented, user interaction needed:', e);
            });
          }
          
          remoteStreamRef.current = remoteStream;
        } else {
          // Fallback: add track to our created stream
          console.log('Adding track to remote stream manually');
          remoteStreamRef.current?.addTrack(event.track);
          
          if (event.track.kind === 'audio' && remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStreamRef.current;
            remoteAudioRef.current.play().catch(e => {
              console.log('Auto-play prevented:', e);
            });
          }
          
          if (event.track.kind === 'video' && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
          }
        }
        
        // Also try to play track directly
        event.track.onunmute = () => {
          console.log('Track unmuted:', event.track.kind);
        };
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate:', event.candidate.type, event.candidate.protocol);
          signalingRef.current?.sendIceCandidate(event.candidate);
        } else {
          console.log('ICE gathering complete');
        }
      };

      pc.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', pc.iceGatheringState);
      };

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log('Connection state changed to:', pc.connectionState);
        setConnectionState(pc.connectionState);
        
        if (pc.connectionState === 'connected') {
          console.log('WebRTC connected! Starting call timer.');
          setCallStatus('connected');
          setIsWebRTCReady(true);
          
          // Ensure audio is playing
          if (remoteAudioRef.current && remoteAudioRef.current.srcObject) {
            remoteAudioRef.current.play().catch(e => console.log('Play error:', e));
          }
        } else if (pc.connectionState === 'failed') {
          console.error('Connection failed');
          toast({
            title: "Connexion échouée",
            description: "Impossible d'établir la connexion. Réessayez.",
            variant: "destructive",
          });
        } else if (pc.connectionState === 'disconnected') {
          console.log('Connection disconnected');
          toast({
            title: "Connexion perdue",
            description: "La connexion avec l'autre utilisateur a été interrompue",
            variant: "destructive",
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          console.log('ICE connected, call should be active now');
          setCallStatus('connected');
          setIsWebRTCReady(true);
        }
      };

      pc.onsignalingstatechange = () => {
        console.log('Signaling state:', pc.signalingState);
      };

      // Setup signaling
      console.log('Setting up signaling channel...');
      signalingRef.current = new WebRTCSignaling(
        callId,
        user.id,
        userId,
        handleSignalingMessage
      );
      await signalingRef.current.connect();
      console.log('Signaling connected');

      // Process any pending candidates that arrived before PC was ready
      if (pendingCandidatesRef.current.length > 0) {
        console.log('Processing', pendingCandidatesRef.current.length, 'pending candidates');
      }

      // If initiator, create and send offer
      if (isInitiator && !hasCreatedOfferRef.current) {
        hasCreatedOfferRef.current = true;
        console.log('Creating offer...');
        
        // Small delay to ensure everything is set up
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: callType === 'video',
        });
        console.log('Offer created:', offer.type);
        
        await pc.setLocalDescription(offer);
        console.log('Offer set as local description');
        
        await signalingRef.current.sendOffer(offer);
        console.log('Offer sent');
      }

    } catch (error) {
      console.error('WebRTC initialization error:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'accéder à la caméra/micro",
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
        console.log('Incoming call mode, callId:', incomingCallId);
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
        console.log('Creating outgoing call...');
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
          console.error('Error creating call:', error);
          toast({
            title: "Erreur",
            description: "Impossible d'initier l'appel",
            variant: "destructive",
          });
          navigate('/messages');
          return;
        }

        console.log('Call created:', callData.id);
        setCall(callData as CallType);
        setCallStatus('ringing');
        
        // Initialize WebRTC as initiator
        await initWebRTC(true, callData.id);
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

    console.log('Subscribing to call status changes for:', call.id);

    const channel = supabase
      .channel(`call-status-${call.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
          filter: `id=eq.${call.id}`,
        },
        async (payload) => {
          const updatedCall = payload.new as CallType;
          console.log('Call status updated:', updatedCall.status);
          setCall(updatedCall);

          if (updatedCall.status === 'accepted') {
            console.log('Call accepted by receiver, should be connected');
            // The receiver will init WebRTC, we just wait for connection
          } else if (updatedCall.status === 'rejected') {
            setCallStatus('ended');
            toast({
              title: "Appel refusé",
              description: "L'utilisateur a refusé l'appel",
            });
            setTimeout(() => navigate('/messages'), 2000);
          } else if (updatedCall.status === 'ended') {
            setCallStatus('ended');
            setTimeout(() => navigate('/messages'), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [call?.id, navigate, toast]);

  // Call duration timer
  useEffect(() => {
    if (callStatus !== 'connected' || !isWebRTCReady) return;

    console.log('Starting call duration timer');
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus, isWebRTCReady]);

  const cleanup = useCallback(() => {
    console.log('Cleaning up WebRTC resources');
    
    // Stop local stream
    localStreamRef.current?.getTracks().forEach(track => {
      track.stop();
      console.log('Stopped local track:', track.kind);
    });
    localStreamRef.current = null;
    
    // Clear remote stream
    remoteStreamRef.current = null;
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Disconnect signaling
    signalingRef.current?.disconnect();
    signalingRef.current = null;

    // Clear pending candidates
    pendingCandidatesRef.current = [];
    hasCreatedOfferRef.current = false;
  }, []);

  const acceptCall = async () => {
    if (!call) return;

    console.log('Accepting call:', call.id);

    // Update call status first
    await supabase
      .from('calls')
      .update({ 
        status: 'accepted',
        started_at: new Date().toISOString(),
      })
      .eq('id', call.id);

    setCallStatus('connecting');
    
    // Initialize WebRTC as receiver (not initiator)
    await initWebRTC(false, call.id);
  };

  const rejectCall = async () => {
    if (!call) return;

    console.log('Rejecting call:', call.id);

    await supabase
      .from('calls')
      .update({ status: 'rejected' })
      .eq('id', call.id);

    cleanup();
    navigate('/messages');
  };

  const endCall = async () => {
    console.log('Ending call');
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
        console.log('Mute toggled:', !audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log('Video toggled:', videoTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // User click handler to ensure audio plays (mobile requirement)
  const handleUserInteraction = () => {
    if (remoteAudioRef.current && remoteAudioRef.current.srcObject) {
      remoteAudioRef.current.play().catch(e => console.log('Play after interaction:', e));
    }
  };

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" onClick={handleUserInteraction}>
      {/* Hidden audio element for remote audio - CRITICAL */}
      <audio 
        ref={remoteAudioRef} 
        autoPlay 
        playsInline
        style={{ display: 'none' }}
      />

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
            {formatDuration(callDuration)}
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
            {callStatus === 'connecting' && 'Connexion en cours...'}
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

          {callStatus === 'connecting' && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-xs text-muted-foreground">
                État: {connectionState}
              </p>
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

        {/* Connected or Outgoing: Mute, Video toggle, End call */}
        {(callStatus === 'connected' || callStatus === 'connecting' || (callStatus === 'ringing' && !incomingCallId)) && (
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
