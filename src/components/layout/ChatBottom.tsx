import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Mic, MicOff, StopCircle, Trash2, Camera as CameraIcon, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChatMessageMenu, 
  ChatEditPreview, 
  ChatReplyPreview, 
  EmojiPickerMenu 
} from '../../components/ChatUIComponents.tsx';

interface ChatBottomProps {
  activeMessageMenu: any;
  setActiveMessageMenu: (msg: any) => void;
  setReplyingTo: (msg: any) => void;
  startEdit: (msg: any) => void;
  deleteMessage: (id: string) => void;
  currentUserUid: string | undefined;
  setShowReactionPicker: (msg: any) => void;
  editingMessage: any;
  setEditingMessage: (msg: any) => void;
  newMessage: string;
  setNewMessage: (text: string | ((prev: string) => string)) => void;
  replyingTo: any;
  receiver: any;
  handleSendMessage: (e: React.FormEvent | { preventDefault: () => void }) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPlusMenu: boolean;
  setShowPlusMenu: (show: boolean) => void;
  plusMenuRef: React.RefObject<HTMLDivElement | null>;
  chatId: string | undefined;
  filePreviewUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  setSelectedFile: (file: File | Blob | null) => void;
  setFilePreviewUrl: (url: string | null) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleTyping: () => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  emojiPickerRef: React.RefObject<HTMLDivElement | null>;
  isSending: boolean;
  selectedFile: File | Blob | null;
}

export default function ChatBottom({
  activeMessageMenu,
  setActiveMessageMenu,
  setReplyingTo,
  startEdit,
  deleteMessage,
  currentUserUid,
  setShowReactionPicker,
  editingMessage,
  setEditingMessage,
  newMessage,
  setNewMessage,
  replyingTo,
  receiver,
  handleSendMessage,
  fileInputRef,
  imageInputRef,
  handleFileChange,
  showPlusMenu,
  setShowPlusMenu,
  plusMenuRef,
  chatId,
  filePreviewUrl,
  isUploading,
  uploadProgress,
  setSelectedFile,
  setFilePreviewUrl,
  textareaRef,
  handleTyping,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiPickerRef,
  isSending,
  selectedFile
}: ChatBottomProps) {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setSelectedFile(audioBlob);
        setFilePreviewUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // We'll filter the stop event to not set a file
      mediaRecorderRef.current.onstop = () => {
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
      };
    }
  };

  const formatRecTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isMicMode = !newMessage.trim() && !selectedFile && !isRecording;

  return (
    <div className="shrink-0 bg-[var(--nav-bg)] px-2 sm:px-4 py-1.5 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] relative border-t border-white/10 w-full max-w-full rounded-t-2xl">
      <ChatMessageMenu 
        activeMessageMenu={activeMessageMenu}
        setActiveMessageMenu={setActiveMessageMenu}
        setReplyingTo={setReplyingTo}
        startEdit={startEdit}
        deleteMessage={deleteMessage}
        currentUserUid={currentUserUid}
        setShowReactionPicker={setShowReactionPicker}
      />

      <ChatEditPreview 
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
        setNewMessage={(text) => setNewMessage(text)}
      />

      <ChatReplyPreview 
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        receiver={receiver}
        currentUserUid={currentUserUid}
      />

      <div className="flex items-center gap-1.5 sm:gap-2.5 w-full max-w-full relative py-0.5 sm:py-1">
        {!isRecording && (
          <div className="flex items-center shrink-0">
            <input 
              type="file" 
              ref={imageInputRef} 
              className="hidden" 
              accept="image/*,video/*" 
              onChange={handleFileChange}
            />
            <button 
              onClick={() => navigate(`/camera?chatId=${chatId}`)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-sky-500 text-white rounded-full shadow-lg shadow-sky-500/20 active:scale-90 transition-all"
              title="Camera"
            >
              <CameraIcon size={18} className="sm:size-5" />
            </button>
          </div>
        )}

        <div className={`flex-1 min-w-0 bg-[var(--bg-card)] rounded-[22px] px-2 sm:px-3.5 py-0.5 flex flex-col transition-all border border-[var(--border-color)] ${isRecording ? 'bg-red-50/10 border-red-500/30' : ''}`}>
          {selectedFile && !isRecording && (
            <div className="mt-1 mb-2 relative w-fit group">
              <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)] shadow-lg max-w-[120px] sm:max-w-[150px] bg-black/5 p-1.5">
                {filePreviewUrl ? (
                  selectedFile?.type.startsWith('video/') ? (
                    <video src={filePreviewUrl} className="w-full h-auto rounded-lg" muted />
                  ) : selectedFile?.type.startsWith('audio/') ? (
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Mic size={14} className="text-sky-500" />
                      <span className="text-[10px] font-black text-[var(--text-primary)]">Voice Message</span>
                    </div>
                  ) : (
                    <img src={filePreviewUrl} alt="Preview" className="w-full h-auto rounded-lg" />
                  )
                ) : (
                  <div className="flex flex-col items-center gap-1 py-1 px-1">
                    <Paperclip className="text-[var(--text-secondary)]" size={18} />
                    <p className="text-[9px] text-[var(--text-secondary)] font-bold truncate w-[60px] sm:w-[80px] text-center">{(selectedFile as File).name}</p>
                  </div>
                )}
                {!isUploading && !isSending && (
                  <button 
                    type="button"
                    onClick={() => { setSelectedFile(null); setFilePreviewUrl(null); }}
                    className="absolute top-0.5 right-0.5 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all shadow-sm"
                  >
                    <X size={10} />
                  </button>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-[10px] font-black">{uploadProgress}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-end w-full gap-1 sm:gap-2">
            {isRecording ? (
              <div className="flex-1 min-w-0 flex items-center justify-between py-2 px-1 animate-pulse">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="text-[12px] sm:text-[14px] font-black tracking-tight text-red-500">{formatRecTime(recordingTime)}</span>
                </div>
                <button 
                  onClick={cancelRecording}
                  className="px-2 sm:px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <textarea 
                  ref={textareaRef}
                  placeholder="Message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  rows={1}
                  className="flex-1 min-w-0 bg-transparent text-[14px] sm:text-[15px] font-medium focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/40 py-2 sm:py-2.5 resize-none max-h-[120px] leading-tight"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isMicMode) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                />
                
                <div className="flex items-center gap-0.5 sm:gap-1 pb-1 sm:pb-1.5 shrink-0">
                  <EmojiPickerMenu 
                    showEmojiPicker={showEmojiPicker}
                    setShowEmojiPicker={setShowEmojiPicker}
                    emojiPickerRef={emojiPickerRef}
                    onEmojiSelect={(emoji) => {
                      setNewMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                      textareaRef.current?.focus();
                    }}
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 sm:p-2 text-[var(--text-secondary)] opacity-60 hover:opacity-100 transition-opacity"
                    title="Attach File"
                  >
                    <Paperclip size={18} className="sm:size-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <button 
          type="button" 
          onClick={(e) => {
            if (isRecording) {
              stopRecording();
            } else if (isMicMode) {
              startRecording();
            } else {
              handleSendMessage(e as any);
            }
          }}
          disabled={((!newMessage.trim() && !selectedFile) && !isMicMode && !isRecording) || isSending || isUploading}
          className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-white transition-all shadow-lg active:scale-90 hover:brightness-110 ${
            isRecording ? 'bg-red-500 ring-4 ring-red-500/20' : 'bg-sky-500 shadow-sky-500/20'
          }`}
        >
          {isSending ? (
            <Loader2 size={18} className="sm:size-5 animate-spin" />
          ) : isRecording ? (
            <StopCircle size={20} className="sm:size-5.5" />
          ) : isMicMode ? (
            <Mic size={20} className="sm:size-5.5" />
          ) : (
            <Send size={18} className="sm:size-5 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
