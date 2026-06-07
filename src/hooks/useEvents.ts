import { useEffect, useState, useCallback } from 'react';
import { createDynamicSupabaseClient, getSupabaseCredentials } from '../lib/supabase';
import { LogEvent } from '../types';
import { initialEvents, randomSubscribers, COMMIT_MESSAGES } from '../data/mockData';

export function useEvents() {
  const [events, setEvents] = useState<LogEvent[]>(initialEvents);
  const [realtimeActive, setRealtimeActive] = useState(getSupabaseCredentials().isReal);
  const [sessionToken, setSessionToken] = useState(0);

  // Helper to append events
  const addEvent = useCallback((newEvent: Omit<LogEvent, 'id' | 'created_at'>) => {
    const freshEvent: LogEvent = {
      ...newEvent,
      id: `e-sim-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    setEvents((prev) => [freshEvent, ...prev]);
  }, []);

  // Expose reload routine
  const triggerReload = useCallback(() => {
    setSessionToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setRealtimeActive(creds.isReal);

    if (creds.isReal) {
      const activeClient = createDynamicSupabaseClient();
      
      // 1. Fetch existing events from Supabase
      const fetchEvents = async () => {
        try {
          const { data, error } = await activeClient
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            setEvents(data);
          } else if (error) {
            console.warn('Real Supabase query returned error or empty table:', error);
          }
        } catch (err) {
          console.warn('Failed to fetch from real Supabase database. Falling back to simulations.', err);
        }
      };

      fetchEvents();

      // 2. Real-time Subscription feed
      const channel = activeClient
        .channel('realtime-events')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events' },
          (payload: any) => {
            if (payload.new) {
              setEvents((prev) => [payload.new as LogEvent, ...prev]);
            }
          }
        )
        .subscribe();

      return () => {
         try {
           activeClient.removeChannel(channel);
         } catch (e) {
           // ignore clean up faults for mock structures
         }
      };
    }
  }, [sessionToken]);

  // --- Dynamic Simulation Engine ---
  // To breathe life into the "live ocean stream" when mock-mode is active,
  // we add custom simulation loops that generate real-sounding events
  useEffect(() => {
    const creds = getSupabaseCredentials();
    if (creds.isReal) return;

    const interval = setInterval(() => {
      // Randomly trigger an event: deploy, error, payment, or sync
      const types: LogEvent['type'][] = ['deploy', 'sync', 'payment', 'error'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      
      const email = randomSubscribers[Math.floor(Math.random() * randomSubscribers.length)];
      const commit = COMMIT_MESSAGES[Math.floor(Math.random() * COMMIT_MESSAGES.length)];

      switch (chosenType) {
        case 'deploy':
          addEvent({
            type: 'deploy',
            message: `SwellTracker API client built automatically via push to main`,
            metadata: { branch: 'main', duration_ms: Math.floor(Math.random() * 8000) + 2000, trigger: 'git-commit' },
          });
          break;
        case 'sync':
          addEvent({
            type: 'sync',
            message: `GitHub synchronized: Reef storage pulled latest active tree commits`,
            metadata: { commits_synced: 1, last_commit: commit, origin: 'github-webhook' },
          });
          break;
        case 'payment':
          addEvent({
            type: 'payment',
            message: `Checkout session complete: subscriber level activated`,
            metadata: { email, amount: [1900, 4900, 29900][Math.floor(Math.random() * 3)], currency: 'usd', source: 'Stripe Webhook' },
          });
          break;
        case 'error':
          // Keep failure rate low but present
          if (Math.random() > 0.6) {
            addEvent({
              type: 'error',
              message: `High Tide Overflow Warning: Wave calculations took more than 500ms`,
              metadata: { severity: 'warning', peak_ms: 782, node: 'us-east1-a' },
            });
          }
          break;
      }
    }, 12000); // Trigger a mock event every 12 seconds to show active wave animation

    return () => clearInterval(interval);
  }, [addEvent, sessionToken]);

  return {
    events,
    addEvent,
    realtimeActive,
    triggerReload,
  };
}
