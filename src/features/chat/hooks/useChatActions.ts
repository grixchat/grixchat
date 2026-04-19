import { useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  writeBatch,
  query,
  where,
  getDocs,
  orderBy,
  increment
} from 'firebase/firestore';
import { db, auth } from '../../../services/firebase.ts';
import { ImageService } from '../../../services/ImageService.ts';
import { GofileService } from '../services/GofileService.ts';
import { toDate } from '../../../utils/dateUtils.ts';

export const useChatActions = (chatId: string, receiverId: string, receiver: any) => {
  
  const sendMessage = useCallback(async ({
    text,
    file,
    replyTo,
    onProgress
  }: {
    text: string;
    file?: File | null;
    replyTo?: any;
    onProgress?: (progress: number) => void;
  }) => {
    if (!auth.currentUser) return;

    try {
      let fileUrl = '';
      let fileType: 'text' | 'image' | 'file' = 'text';
      let fileName = '';

      if (file) {
        fileName = file.name;
        if (file.type.startsWith('image/')) {
          fileUrl = await ImageService.uploadImage(file, onProgress);
          fileType = 'image';
        } else {
          // Use Gofile for other file types
          fileUrl = await GofileService.uploadFile(file);
          fileType = 'file';
        }
      }

      const messageData = {
        chatId,
        senderId: auth.currentUser.uid,
        receiverId,
        text: text || (fileType === 'file' ? `Sent a file: ${fileName}` : ''),
        imageUrl: fileType === 'image' ? (fileUrl || null) : null,
        fileUrl: fileType === 'file' ? (fileUrl || null) : null,
        fileName: fileType === 'file' ? (fileName || null) : null,
        timestamp: serverTimestamp(),
        isRead: false,
        type: fileType,
        replyTo: replyTo ? { id: replyTo.id, text: replyTo.text, senderId: replyTo.senderId } : null
      };

      await addDoc(collection(db, "messages"), messageData);

      // Update Conversations Collection (Optimized for Chat List)
      const conversationRef = doc(db, "conversations", chatId);
      await setDoc(conversationRef, {
        lastMessage: messageData.text || 'Sent an image',
        lastMessageTimestamp: serverTimestamp(),
        lastSenderId: auth.currentUser.uid,
        participants: [auth.currentUser.uid, receiverId],
        [`unreadCount_${receiverId}`]: increment(1)
      }, { merge: true });

      // Cleanup: Jab messages 50 ho jayein, to oldest 25 delete kar do (Bulk Delete)
      setTimeout(async () => {
        try {
          const messagesRef = collection(db, "messages");
          const q = query(
            messagesRef, 
            where("chatId", "==", chatId)
          );
          const snapshot = await getDocs(q);
          
          if (snapshot.size >= 50) {
            // Sort in-memory to avoid composite index
            const docs = [...snapshot.docs].sort((a, b) => {
              const timeA = toDate(a.data().timestamp)?.getTime() || 0;
              const timeB = toDate(b.data().timestamp)?.getTime() || 0;
              return timeA - timeB; // Ascending (oldest first)
            });

            const batch = writeBatch(db);
            // Sabse purane 25 messages delete karenge (Bulk Delete)
            const oldestMsgs = docs.slice(0, 25);
            oldestMsgs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          }
        } catch (err) {
          console.error('Cleanup error:', err);
        }
      }, 2000);

      // Send Notification
      if (receiver?.fcmTokens?.length > 0 && receiverId !== 'gx-ai') {
        fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokens: receiver.fcmTokens,
            title: `New message from ${auth.currentUser?.displayName || 'GrixChat User'}`,
            body: text || 'Sent an image',
            data: { chatId, senderId: auth.currentUser?.uid }
          })
        }).catch(err => console.error('Notification error:', err));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }, [chatId, receiverId, receiver]);

  const editMessage = useCallback(async (msgId: string, newText: string) => {
    await updateDoc(doc(db, "messages", msgId), {
      text: newText,
      isEdited: true
    });
  }, []);

  const deleteMessage = useCallback(async (msgId: string) => {
    await deleteDoc(doc(db, "messages", msgId));
  }, []);

  const reactToMessage = useCallback(async (msgId: string, emoji: string) => {
    if (!auth.currentUser) return;
    const msgRef = doc(db, "messages", msgId);
    const msgDoc = await getDoc(msgRef);
    if (msgDoc.exists()) {
      const reactions = msgDoc.data().reactions || {};
      if (reactions[auth.currentUser.uid] === emoji) {
        delete reactions[auth.currentUser.uid];
      } else {
        reactions[auth.currentUser.uid] = emoji;
      }
      await updateDoc(msgRef, { reactions });
    }
  }, []);

  const clearChat = useCallback(async () => {
    const q = query(collection(db, "messages"), where("chatId", "==", chatId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }, [chatId]);

  return { sendMessage, editMessage, deleteMessage, reactToMessage, clearChat };
};
