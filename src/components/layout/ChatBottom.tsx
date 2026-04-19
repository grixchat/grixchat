import React from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { 
  ChatMessageMenu, 
  ChatEditPreview, 
  ChatReplyPreview, 
  ChatPlusMenu, 
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
  handleSendMessage: (e: React.FormEvent) => void;
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
  setSelectedFile: (file: File | null) => void;
  setFilePreviewUrl: (url: string | null) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleTyping: () => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  emojiPickerRef: React.RefObject<HTMLDivElement | null>;
  isSending: boolean;
  selectedFile: File | null;
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
  return (
    <div className="shrink-0 bg-[var(--nav-bg)] px-4 py-1.5 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] relative border-t border-white/10 w-full max-w-full rounded-t-2xl">
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

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full max-w-full">
        <input 
          type="file" 
          ref={imageInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
        <ChatPlusMenu 
          showPlusMenu={showPlusMenu}
          setShowPlusMenu={setShowPlusMenu}
          plusMenuRef={plusMenuRef}
          onMediaClick={() => imageInputRef.current?.click()}
          onFileClick={() => fileInputRef.current?.click()}
          chatId={chatId}
        />

        <div className="flex-1 bg-[var(--bg-main)] rounded-[20px] px-4 py-1.5 flex flex-col shadow-inner min-w-0 transition-all border border-[var(--border-color)]">
          {selectedFile && (
            <div className="mb-2 relative w-fit group">
              <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-lg max-w-[120px] bg-white/5 p-2">
                {filePreviewUrl ? (
                  <img src={filePreviewUrl} alt="Preview" className="w-full h-auto rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center gap-1 py-2 px-1">
                    <X className="text-white/40" size={24} />
                    <p className="text-[10px] text-white/60 font-bold truncate w-full text-center">{selectedFile.name}</p>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mb-1" />
                    <span className="text-white text-[10px] font-bold">{uploadProgress}%</span>
                  </div>
                )}
                {!isUploading && (
                  <button 
                    type="button"
                    onClick={() => { setSelectedFile(null); setFilePreviewUrl(null); }}
                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="flex items-end w-full">
            <textarea 
              ref={textareaRef}
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
                // Auto-expand
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              rows={1}
              className="flex-1 bg-transparent text-[16px] focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] py-1.5 resize-none max-h-[120px] leading-tight"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
            />
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
          </div>
        </div>

        <button 
          type="submit"
          disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading}
          className="bg-[var(--primary)] w-11 h-11 flex items-center justify-center rounded-full text-[var(--primary-foreground)] disabled:opacity-50 transition-all shadow-lg active:scale-95 shrink-0"
        >
          {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
        </button>
      </form>
    </div>
  );
}
