import React from 'react';
import { 
  Trash,
  UserX, 
  AlertTriangle,
  Plus,
  Mic,
  Image as ImageIcon,
  FileText,
  X,
  Reply,
  Forward,
  Edit2,
  Smile,
  Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChatMessageReactions: React.FC<{
  onReact: (emoji: string) => void;
  onClose: () => void;
  position: 'left' | 'right';
}> = ({ onReact, onClose, position }) => {
  const emojis = ['❤️', '😂', '😮', '😢', '🔥', '👍'];
  return (
    <div 
      className={`absolute bottom-full mb-2 flex items-center gap-1 bg-[var(--bg-card)] rounded-full shadow-xl border border-[var(--border-color)] p-1 z-[9999] animate-in zoom-in-95 duration-150 ${position === 'right' ? 'right-0' : 'left-0'}`}
      onClick={(e) => e.stopPropagation()}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => { onReact(emoji); onClose(); }}
          className="w-9 h-9 flex items-center justify-center hover:bg-[var(--bg-main)] rounded-full transition-all active:scale-125 text-xl"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export const ChatMessageMenu: React.FC<{
  activeMessageMenu: any;
  setActiveMessageMenu: (msg: any) => void;
  setReplyingTo: (msg: any) => void;
  startEdit: (msg: any) => void;
  deleteMessage: (id: string) => void;
  currentUserUid: string | undefined;
  setShowReactionPicker: (msg: any) => void;
}> = ({ activeMessageMenu, setActiveMessageMenu, setReplyingTo, startEdit, deleteMessage, currentUserUid, setShowReactionPicker }) => {
  if (!activeMessageMenu) return null;
  const isMe = activeMessageMenu.senderId === currentUserUid;

  return (
    <div className="absolute bottom-full right-4 mb-3 w-40 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-color)] py-1 z-[9999] overflow-hidden">
      <div className="px-3 py-1.5 border-b border-[var(--border-color)] mb-1">
        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Message Options</p>
      </div>
      <button onClick={() => { setShowReactionPicker(activeMessageMenu); setActiveMessageMenu(null); }} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] flex items-center gap-3 transition-colors">
        <Smile size={16} className="text-[var(--text-secondary)]" /> React
      </button>
      <button onClick={() => { setReplyingTo(activeMessageMenu); setActiveMessageMenu(null); }} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] flex items-center gap-3 transition-colors">
        <Reply size={16} className="text-[var(--text-secondary)]" /> Reply
      </button>
      {isMe && (
        <button onClick={() => startEdit(activeMessageMenu)} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] flex items-center gap-3 transition-colors">
          <Edit2 size={16} className="text-[var(--text-secondary)]" /> Edit
        </button>
      )}
      <button onClick={() => setActiveMessageMenu(null)} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] flex items-center gap-3 transition-colors">
        <Forward size={16} className="text-[var(--text-secondary)]" /> Forward
      </button>
      {isMe && (
        <button onClick={() => deleteMessage(activeMessageMenu.id)} className="w-full px-4 py-2.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] flex items-center gap-3 transition-colors">
          <Trash size={16} className="text-[var(--text-secondary)]" /> Delete
        </button>
      )}
      <button onClick={() => setActiveMessageMenu(null)} className="w-full px-4 py-2 text-center text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-1">
        Cancel
      </button>
    </div>
  );
};

export const ChatReplyPreview: React.FC<{
  replyingTo: any;
  setReplyingTo: (msg: any) => void;
  receiver: any;
  currentUserUid: string | undefined;
}> = ({ replyingTo, setReplyingTo, receiver, currentUserUid }) => {
  if (!replyingTo) return null;
  return (
    <div className="mb-2 mx-2 p-2 bg-black/20 rounded-xl border-l-[6px] border-[var(--primary)] flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-3 flex-1 min-w-0 px-2">
        <div className="p-1.5 bg-[var(--primary)]/10 rounded-full">
          <Reply size={14} className="text-[var(--primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-white uppercase tracking-widest opacity-80">
            Replying to {replyingTo.senderId === currentUserUid ? 'yourself' : receiver?.fullName}
          </p>
          <p className="text-[13px] text-white/70 font-medium truncate italic">"{replyingTo.text}"</p>
        </div>
      </div>
      <button 
        onClick={() => setReplyingTo(null)} 
        className="p-1.5 hover:bg-white/10 rounded-full transition-all active:scale-90"
      >
        <X size={18} className="text-white/70" />
      </button>
    </div>
  );
};

export const ChatEditPreview: React.FC<{
  editingMessage: any;
  setEditingMessage: (msg: any) => void;
  setNewMessage: (text: string) => void;
}> = ({ editingMessage, setEditingMessage, setNewMessage }) => {
  if (!editingMessage) return null;
  return (
    <div className="mb-2 mx-2 p-2 bg-black/20 rounded-xl border-l-[6px] border-[var(--primary)] flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-3 flex-1 min-w-0 px-2">
        <div className="p-1.5 bg-[var(--primary)]/10 rounded-full">
          <Edit2 size={14} className="text-[var(--primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-white uppercase tracking-widest opacity-80">Editing Message</p>
          <p className="text-[13px] text-white/70 font-medium truncate italic">"{editingMessage.text}"</p>
        </div>
      </div>
      <button 
        onClick={() => { setEditingMessage(null); setNewMessage(''); }} 
        className="p-1.5 hover:bg-white/10 rounded-full transition-all active:scale-90"
      >
        <X size={18} className="text-white/70" />
      </button>
    </div>
  );
};

export const ChatPlusMenu: React.FC<{
  showPlusMenu: boolean;
  setShowPlusMenu: (show: boolean) => void;
  plusMenuRef: React.RefObject<HTMLDivElement | null>;
  onMediaClick?: () => void;
  onFileClick?: () => void;
  chatId?: string;
}> = ({ showPlusMenu, setShowPlusMenu, plusMenuRef, onMediaClick, onFileClick, chatId }) => {
  const navigate = useNavigate();
  return (
    <div className="relative" ref={plusMenuRef}>
      <button type="button" onClick={() => setShowPlusMenu(!showPlusMenu)} className="p-2 text-[var(--text-primary)] hover:bg-[var(--bg-main)] rounded-full transition-colors shrink-0">
        <Plus size={24} />
      </button>
      {showPlusMenu && (
        <div className="absolute bottom-full left-0 mb-3 w-40 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-color)] py-1 z-[9999] overflow-hidden">
          <button 
            onClick={() => { navigate(`/camera?chatId=${chatId}`); setShowPlusMenu(false); }}
            className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] flex items-center gap-3 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-[var(--primary)]"><Camera size={16} /></div> Camera
          </button>
          <button className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] flex items-center gap-3 transition-colors">
            <div className="w-7 h-7 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-[var(--primary)]"><Mic size={16} /></div> Microphone
          </button>
          <button 
            onClick={() => { onMediaClick?.(); setShowPlusMenu(false); }}
            className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] flex items-center gap-3 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-[var(--primary)]"><ImageIcon size={16} /></div> Media
          </button>
          <button 
            onClick={() => { onFileClick?.(); setShowPlusMenu(false); }}
            className="w-full px-3 py-2.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-main)] flex items-center gap-3 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--bg-main)] flex items-center justify-center text-[var(--primary)]"><FileText size={16} /></div> Files
          </button>
        </div>
      )}
    </div>
  );
};

export const EmojiPickerMenu: React.FC<{
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  emojiPickerRef: React.RefObject<HTMLDivElement | null>;
  onEmojiSelect: (emoji: string) => void;
}> = ({ showEmojiPicker, setShowEmojiPicker, emojiPickerRef, onEmojiSelect }) => {
  const emojis = ['😊', '😂', '🥰', '😍', '😒', '😭', '😘', '☺️', '😩', '😔', '😏', '😁', '💕', '❤️', '🔥', '✨', '👍', '🙏', '💯', '🤣', '🤔', '🙄', '🥺', '😎', '🙌', '👏', '🎉', '🎈', '🎂', '🎁'];
  
  return (
    <div className="relative" ref={emojiPickerRef}>
      <button 
        type="button" 
        onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
        className="p-2 text-[var(--text-primary)] hover:bg-[var(--bg-main)] rounded-full transition-colors shrink-0"
      >
        <Smile size={24} />
      </button>
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-3 w-64 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-color)] p-2 z-[9999] animate-in slide-in-from-bottom-2 duration-200">
          <div className="px-2 py-1.5 border-b border-[var(--border-color)] mb-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Emojis</p>
          </div>
          <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto no-scrollbar">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => { onEmojiSelect(emoji); }}
                className="w-9 h-9 flex items-center justify-center hover:bg-[var(--bg-main)] rounded-lg transition-all active:scale-125 text-xl"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

