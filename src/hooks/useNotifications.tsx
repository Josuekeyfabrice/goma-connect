import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const permissionGranted = useRef(false);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        permissionGranted.current = permission === 'granted';
      });
    } else if ('Notification' in window) {
      permissionGranted.current = Notification.permission === 'granted';
    }
  }, []);

  const showNotification = (title: string, body: string, onClick?: () => void) => {
    // Show toast notification
    toast({
      title,
      description: body,
    });

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
      });

      if (onClick) {
        notification.onclick = () => {
          window.focus();
          onClick();
          notification.close();
        };
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const message = payload.new as any;
          
          // Get sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', message.sender_id)
            .single();

          const senderName = sender?.full_name || 'Quelqu\'un';
          
          showNotification(
            'Nouveau message',
            `${senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
            () => {
              window.location.href = '/messages';
            }
          );
        }
      )
      .subscribe();

    // Subscribe to incoming calls - browser notification only
    // The IncomingCallDialog component handles the UI
    const callsChannel = supabase
      .channel('calls-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calls',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const call = payload.new as any;
          
          if (call.status === 'pending') {
            // Get caller info
            const { data: caller } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', call.caller_id)
              .single();

            const callerName = caller?.full_name || 'Quelqu\'un';
            
            // Only show browser notification for background tab
            if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
              const notification = new Notification('Appel entrant', {
                body: `${callerName} vous appelle`,
                icon: '/favicon.ico',
                requireInteraction: true,
              });

              notification.onclick = () => {
                window.focus();
                notification.close();
              };
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(callsChannel);
    };
  }, [user, toast]);

  return { showNotification };
};
