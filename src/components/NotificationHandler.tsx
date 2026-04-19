import { useEffect } from 'react';
import { messagingPromise, auth, db } from '../services/firebase.ts';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../providers/AuthProvider';

export default function NotificationHandler() {
  const { user } = useAuth();

  useEffect(() => {
    const initMessaging = async () => {
      console.log('Initializing FCM...');
      const messaging = await messagingPromise;
      if (!messaging) {
        console.warn('FCM Messaging instance is null');
        return;
      }
      
      if (!auth.currentUser) {
        console.warn('No authenticated user for FCM');
        return;
      }

      if (typeof Notification === 'undefined') {
        console.warn('Notification API is not available');
        return;
      }

      // Check if we are in an iframe
      const isIframe = window.self !== window.top;
      if (isIframe) {
        console.warn('Notifications often fail in iframes. Please open the app in a new tab for testing.');
      }

      try {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error('VITE_FIREBASE_VAPID_KEY is missing! Notifications will not work.');
          return;
        }

        let registration;
        if ('serviceWorker' in navigator) {
          console.log('Registering Service Worker for FCM...');
          // Config is now injected server-side to avoid MIME type issues with query params
          registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker registered successfully');
        } else {
          console.warn('Service Worker is not supported in this browser');
        }

        console.log('Requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('Notification permission status:', permission);
        
        if (permission === 'granted') {
          // Get FCM Token
          console.log('Getting FCM Token...');
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration
          });

          if (token) {
            console.log('FCM Token received:', token);
            // Save token to user document
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
              fcmTokens: arrayUnion(token)
            });
            console.log('FCM Token saved to Firestore');
          } else {
            console.warn('No FCM Token received');
          }
        }
      } catch (error) {
        console.error('Error in FCM initialization:', error);
      }

      // Listen for foreground messages
      console.log('Setting up foreground message listener...');
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        if (payload.notification) {
          try {
            new Notification(payload.notification.title || 'New Message', {
              body: payload.notification.body,
              icon: '/logo.png'
            });
          } catch (e) {
            console.warn('Failed to show foreground notification:', e);
          }
        }
      });
      return unsubscribe;
    };

    let unsubscribeFn: (() => void) | undefined;
    if (user) {
      initMessaging().then(unsub => {
        unsubscribeFn = unsub;
      }).catch(err => {
        console.error('initMessaging failed:', err);
      });
    }

    return () => {
      if (unsubscribeFn) {
        console.log('Cleaning up FCM listener');
        unsubscribeFn();
      }
    };
  }, [user]);

  return null;
}
