import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Call as CallType } from '@/types/database';

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-ended';
  payload?: any;
  callId: string;
  senderId: string;
}

interface UseCallSignalingProps {
  userId: string | null;
  callId: string | null;
  enabled?: boolean;
}

interface UseCallSignalingReturn {
  call: CallType | null;
  isLoading: boolean;
  error: Error | null;
  sendSignalingMessage: (message: SignalingMessage) => Promise<void>;
  updateCallStatus: (status: 'pending' | 'accepted' | 'rejected' | 'ended') => Promise<void>;
  onSignalingMessage: (callback: (message: SignalingMessage) => void) => void;
  sendOffer: (offer: RTCSessionDescriptionInit) => Promise<void>;
  sendAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  sendIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
}

export const useCallSignaling = ({
  userId,
  callId,
  enabled = true,
}: UseCallSignalingProps): UseCallSignalingReturn => {
  const [call, setCall] = useState<CallType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<any>(null);
  const callbacksRef = useRef<Set<(message: SignalingMessage) => void>>(new Set());
  const isMountedRef = useRef(true);

  // Load initial call data
  useEffect(() => {
    if (!callId || !enabled) return;

    const loadCall = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('calls')
          .select('*')
          .eq('id', callId)
          .single();

        if (fetchError) throw fetchError;
        if (isMountedRef.current && data) {
          // Cast to proper type
          const typedCall: CallType = {
            ...data,
            status: data.status as CallType['status'],
            call_type: data.call_type as CallType['call_type']
          };
          setCall(typedCall);
        }
      } catch (err: any) {
        console.error('Error loading call:', err);
        if (isMountedRef.current) {
          setError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadCall();

    return () => {
      isMountedRef.current = false;
    };
  }, [callId, enabled]);

  // Set up realtime channel for signaling using Broadcast
  useEffect(() => {
    if (!callId || !userId || !enabled) return;

    const channelName = `call:${callId}`;
    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: 'signaling' }, (payload) => {
        const message = payload.payload as SignalingMessage;
        // Don't process own messages
        if (message.senderId !== userId) {
          callbacksRef.current.forEach((cb) => cb(message));
        }
      })
      .subscribe((status) => {
        console.log(`Channel ${channelName} status:`, status);
      });

    channelRef.current = channel;

    // Subscribe to call status changes
    const callChannel = supabase
      .channel(`call-status:${callId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
          filter: `id=eq.${callId}`,
        },
        (payload) => {
          if (isMountedRef.current) {
            setCall(payload.new as CallType);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(callChannel);
    };
  }, [callId, userId, enabled]);

  const sendSignalingMessage = useCallback(
    async (message: SignalingMessage) => {
      if (!channelRef.current || !callId || !userId) {
        console.warn('Cannot send signaling: channel not ready');
        return;
      }

      try {
        // Send via broadcast for real-time delivery
        await channelRef.current.send({
          type: 'broadcast',
          event: 'signaling',
          payload: { ...message, senderId: userId, callId }
        });
      } catch (err) {
        console.error('Signaling error:', err);
      }
    },
    [callId, userId]
  );

  const sendOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      await sendSignalingMessage({
        type: 'offer',
        payload: offer,
        callId: callId || '',
        senderId: userId || '',
      });
    },
    [sendSignalingMessage, callId, userId]
  );

  const sendAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      await sendSignalingMessage({
        type: 'answer',
        payload: answer,
        callId: callId || '',
        senderId: userId || '',
      });
    },
    [sendSignalingMessage, callId, userId]
  );

  const sendIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      await sendSignalingMessage({
        type: 'ice-candidate',
        payload: candidate,
        callId: callId || '',
        senderId: userId || '',
      });
    },
    [sendSignalingMessage, callId, userId]
  );

  const updateCallStatus = useCallback(
    async (status: 'pending' | 'accepted' | 'rejected' | 'ended') => {
      if (!callId) {
        throw new Error('Missing callId');
      }

      try {
        const updateData: any = { status };

        if (status === 'accepted') {
          updateData.started_at = new Date().toISOString();
        } else if (status === 'ended') {
          updateData.ended_at = new Date().toISOString();
        }

        const { error: updateError } = await supabase
          .from('calls')
          .update(updateData)
          .eq('id', callId);

        if (updateError) throw updateError;

        // Notify via broadcast
        if (status === 'ended') {
          await sendSignalingMessage({
            type: 'call-ended',
            callId,
            senderId: userId || '',
          });
        }
      } catch (err: any) {
        console.error('Error updating call status:', err);
        throw err;
      }
    },
    [callId, userId, sendSignalingMessage]
  );

  const onSignalingMessage = useCallback(
    (callback: (message: SignalingMessage) => void) => {
      callbacksRef.current.add(callback);
      return () => {
        callbacksRef.current.delete(callback);
      };
    },
    []
  );

  return {
    call,
    isLoading,
    error,
    sendSignalingMessage,
    updateCallStatus,
    onSignalingMessage,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
  };
};