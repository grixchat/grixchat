import { useEffect } from 'react';
import { messagingPromise, auth, db } from '../services/firebase.ts';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { useAuth } from '../providers/AuthProvider';

export default function NotificationHandler() {
  const { user } = useAuth();

  useEffect(() => {
    const initMessaging = async () => {
      console.log('FCM: Initializing...');
      
      const isIframe = window.self !== window.top;
      
      const messaging = await messagingPromise;
      if (!messaging) {
        console.warn('FCM: Messaging instance is null.');
        if (isIframe) {
          console.warn('FCM: Notifications are likely disabled because the app is running inside an iframe. Please open GrixChat in a new tab.');
        }
        return;
      }
      
      if (!auth.currentUser) {
        console.warn('FCM: No authenticated user');
        return;
      }

      if (typeof Notification === 'undefined') {
        console.warn('FCM: Notification API not supported by browser');
        return;
      }

      // Detect iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

      if (isIOS && !isStandalone) {
        console.warn('On iOS, notifications only work if you "Add to Home Screen" first.');
        // We could show a UI hint here
      }

      try {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey || vapidKey === "undefined") {
          console.error('FCM: VITE_FIREBASE_VAPID_KEY is missing!');
          return;
        }

        let registration;
        if ('serviceWorker' in navigator) {
          console.log('FCM: Registering/Checking Service Worker...');
          // Check for existing registration for our specific SW
          const regs = await navigator.serviceWorker.getRegistrations();
          const existingReg = regs.find(r => r.active && r.active.scriptURL.includes('firebase-messaging-sw.js'));
          
          if (existingReg) {
            registration = existingReg;
            console.log('FCM: Using existing Service Worker');
          } else {
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/'
            });
            console.log('FCM: New Service Worker registered');
          }
        } else {
          console.warn('FCM: Service Worker not supported');
          return;
        }

        await navigator.serviceWorker.ready;

        const permission = await Notification.requestPermission();
        console.log('FCM: Permission status:', permission);
        
        if (permission === 'granted') {
          console.log('FCM: Getting Token...');
          try {
            // Force fetch token to ensure it's fresh
            const token = await getToken(messaging, {
              vapidKey: vapidKey,
              serviceWorkerRegistration: registration
            });

            if (token) {
              console.log('FCM: Current Token:', token.substring(0, 10) + '...');
              const userRef = doc(db, 'users', auth.currentUser.uid);
              
              // Use setDoc with merge to ensure it works even if doc doesn't exist yet
              await setDoc(userRef, {
                fcmTokens: arrayUnion(token),
                lastTokenRefresh: new Date().toISOString()
              }, { merge: true });
              console.log('FCM: Token verified and synced');
            } else {
              console.warn('FCM: No token received');
            }
          } catch (tokenError: any) {
            console.error('FCM: Token error:', tokenError);
          }
        }
      } catch (error: any) {
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
