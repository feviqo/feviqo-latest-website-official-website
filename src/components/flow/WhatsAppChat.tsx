import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Check,
  CheckCheck, 
  Phone, 
  Video, 
  MoreVertical, 
  FileVideo, 
  Play, 
  Pause, 
  X,
  FileText,
  Download,
  ShieldCheck,
  Sparkles,
  Info,
  Users,
  Crown,
  Trash2
} from 'lucide-react';
import { ChatMessage, ClientProject } from '../../types';

interface WhatsAppChatProps {
  project: ClientProject;
  currentUserRole: 'client' | 'editor' | 'admin';
  currentUserName: string;
  onSendMessage: (projectId: string, message: Omit<ChatMessage, 'id' | 'projectId'>) => void;
  onUpdateMessageStatus?: (projectId: string, messageId: string, status: 'sent' | 'delivered' | 'read') => void;
  onMarkMessagesRead?: (projectId: string, readerRole: 'client' | 'editor' | 'admin') => void;
  onDeleteMessage?: (projectId: string, messageId: string) => void;
  editorName?: string;
  clientName?: string;
  className?: string;
  onClose?: () => void;
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({
  project,
  currentUserRole,
  currentUserName,
  onSendMessage,
  onUpdateMessageStatus,
  onMarkMessagesRead,
  onDeleteMessage,
  editorName = 'Marco Silvestri',
  clientName = 'Client',
  className = '',
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [activeCallNotice, setActiveCallNotice] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<any>(null);

  // Real project messages only (no fake fabricated messages)
  const messages: ChatMessage[] = project.chatMessages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mark unread messages from counterparty as read whenever viewing this chat
  useEffect(() => {
    if (onMarkMessagesRead) {
      onMarkMessagesRead(project.id, currentUserRole);
    }
  }, [project.id, currentUserRole, onMarkMessagesRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, project.id]);

  // Handle Send with WhatsApp real-time tick progression
  const handleSend = () => {
    const cleanText = inputText.trim();
    if (!cleanText) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tempMsgId = 'msg-' + Date.now();

    // 1. Initial status: 'sent' (Single grey tick)
    onSendMessage(project.id, {
      senderName: currentUserName,
      senderRole: currentUserRole,
      text: cleanText,
      timestamp: timeString,
      createdAt: Date.now(),
      status: 'sent',
    });

    setInputText('');
    setShowEmojiPicker(false);

    // 2. After 1000ms: transition to 'delivered' (Double grey tick)
    setTimeout(() => {
      if (onUpdateMessageStatus) {
        // Find latest message or update by status
        const latestMsg = messages[messages.length - 1];
        if (latestMsg) {
          onUpdateMessageStatus(project.id, latestMsg.id, 'delivered');
        }
      }
    }, 1000);

    // 3. After 2800ms: transition to 'read' (Double blue tick)
    setTimeout(() => {
      if (onUpdateMessageStatus) {
        const latestMsg = messages[messages.length - 1];
        if (latestMsg) {
          onUpdateMessageStatus(project.id, latestMsg.id, 'read');
        }
      }
    }, 2800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendQuickAttachment = (name: string, size: string, type: 'video' | 'document' | 'image') => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    onSendMessage(project.id, {
      senderName: currentUserName,
      senderRole: currentUserRole,
      text: type === 'video' ? `Sent video cut: ${name}` : `Sent file: ${name}`,
      timestamp: timeString,
      createdAt: Date.now(),
      status: 'sent',
      attachmentName: name,
      attachmentSize: size,
      attachmentType: type,
    });

    setShowAttachMenu(false);

    // Transition to delivered then read
    setTimeout(() => {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg && onUpdateMessageStatus) {
        onUpdateMessageStatus(project.id, latestMsg.id, 'delivered');
      }
    }, 1000);

    setTimeout(() => {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg && onUpdateMessageStatus) {
        onUpdateMessageStatus(project.id, latestMsg.id, 'read');
      }
    }, 2800);
  };

  const handleToggleVoiceRecord = () => {
    if (isRecordingAudio) {
      // Finish recording and send
      clearInterval(recordingTimerRef.current);
      setIsRecordingAudio(false);
      const durationStr = `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`;
      
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      onSendMessage(project.id, {
        senderName: currentUserName,
        senderRole: currentUserRole,
        text: `Voice Note (${durationStr})`,
        timestamp: timeString,
        createdAt: Date.now(),
        status: 'sent',
        isAudioNote: true,
        audioDuration: durationStr,
      });

      setRecordingSeconds(0);

      setTimeout(() => {
        const latestMsg = messages[messages.length - 1];
        if (latestMsg && onUpdateMessageStatus) {
          onUpdateMessageStatus(project.id, latestMsg.id, 'delivered');
        }
      }, 1000);

      setTimeout(() => {
        const latestMsg = messages[messages.length - 1];
        if (latestMsg && onUpdateMessageStatus) {
          onUpdateMessageStatus(project.id, latestMsg.id, 'read');
        }
      }, 2800);
    } else {
      // Start recording simulation
      setIsRecordingAudio(true);
      setRecordingSeconds(1);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleQuickEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleTriggerCallNotice = (type: 'audio' | 'video') => {
    setActiveCallNotice(`${type === 'video' ? 'Video Conference' : 'Voice Call'} request sent to ${counterpartyName}. In-app studio link active.`);
    setTimeout(() => setActiveCallNotice(null), 4000);
  };

  // Determine who the other person is for the WhatsApp header
  const counterpartyName = currentUserRole === 'editor' 
    ? clientName 
    : currentUserRole === 'admin'
    ? `${clientName} & ${editorName}`
    : editorName;

  const counterpartyRoleDesc = currentUserRole === 'editor'
    ? 'Client'
    : currentUserRole === 'admin'
    ? 'Studio Order Chat'
    : 'Assigned Senior Editor';

  return (
    <div className={`flex flex-col h-full bg-[#EFEAE2] rounded-3xl overflow-hidden border border-slate-300/80 shadow-md font-sans ${className}`}>
      
      {/* 1. AUTHENTIC 3-PERSON PRODUCTION GROUP WHATSAPP HEADER */}
      <div className="bg-[#005C4B] text-white px-4 py-3 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with Group Indicator & 3-member badge */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-white text-sm shadow-inner border border-emerald-300/30">
              <Users className="w-5 h-5 text-emerald-100" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#25D366] text-slate-950 font-black text-[9px] flex items-center justify-center ring-2 ring-[#005C4B]">
              3
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                {project.title || `${clientName} Production Group`}
              </h3>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                3-Person Group
              </span>
              {currentUserRole === 'admin' && (
                <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Crown className="w-3 h-3" /> CEO
                </span>
              )}
            </div>
            <div className="text-[11px] text-emerald-200/90 flex items-center gap-1 font-medium truncate mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block animate-pulse shrink-0" />
              <span className="truncate">
                {clientName} (Client) • {editorName} (Editor) • FEVIQO CEO (Admin)
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-white/90 shrink-0">
          <button 
            type="button" 
            onClick={() => handleTriggerCallNotice('video')}
            title="Video Consultation"
            className="p-2 rounded-full hover:bg-white/10 transition cursor-pointer text-emerald-100 hover:text-white"
          >
            <Video className="w-4 h-4" />
          </button>
          <button 
            type="button" 
            onClick={() => handleTriggerCallNotice('audio')}
            title="Direct Audio Call"
            className="p-2 rounded-full hover:bg-white/10 transition cursor-pointer text-emerald-100 hover:text-white"
          >
            <Phone className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition cursor-pointer text-emerald-100 hover:text-white"
              title="Close chat modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Temporary Call Notice Pill */}
      {activeCallNotice && (
        <div className="bg-[#128C7E] text-white text-xs px-4 py-2 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{activeCallNotice}</span>
          </div>
          <button onClick={() => setActiveCallNotice(null)} className="text-white/80 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. WHATSAPP CHAT CANVAS WITH AUTHENTIC WALLPAPER */}
      <div 
        className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 relative"
        style={{
          backgroundImage: `radial-gradient(#0000000a 1px, transparent 1px), radial-gradient(#00000007 1px, #efeae2 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      >
        {/* Date Divider Pill */}
        <div className="flex justify-center my-1">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] font-bold text-slate-600 shadow-2xs border border-black/5 uppercase tracking-wider">
            Today
          </div>
        </div>

        {/* Security E2E Note Pill */}
        <div className="flex justify-center mb-3">
          <div className="bg-[#FFEECD] text-[#544321] text-[10px] font-medium px-3.5 py-1.5 rounded-lg text-center max-w-sm shadow-2xs border border-amber-200/60">
            🔒 Private studio messages are end-to-end synchronized between client, assigned editor &amp; admin.
          </div>
        </div>

        {/* Empty State when no messages yet */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100/80 text-[#005C4B] flex items-center justify-center mb-3 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Direct Studio Chat</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Live direct channel between you, your assigned video editor, and the CEO. Send instructions, music preferences, or feedback below.
            </p>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((msg) => {
          const isMe = msg.senderRole === currentUserRole || msg.senderName === currentUserName;
          const isAdmin = msg.senderRole === 'admin';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-all`}
            >
              <div
                className={`relative px-3.5 py-2.5 max-w-[85%] sm:max-w-[75%] rounded-[18px] text-xs sm:text-[13px] shadow-xs ${
                  isAdmin
                    ? 'bg-amber-50/95 text-slate-900 border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20 min-w-[260px]'
                    : isMe
                    ? 'bg-[#D9FDD3] text-[#111B21] rounded-tr-xs border border-[#C1F3BA]/70'
                    : 'bg-white text-[#111B21] rounded-tl-xs border border-slate-200/80'
                }`}
              >
                {/* 👑 PROMINENT CEO MESSAGE HEADING BANNER */}
                {isAdmin ? (
                  <div className="mb-2 pb-2 border-b border-amber-300/80 flex items-center justify-between gap-2 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        👑 CEO MESSAGE
                      </span>
                      <span className="text-xs font-black text-amber-950 tracking-tight">
                        {isMe ? 'Studio CEO (You)' : (msg.senderName || 'Studio CEO')}
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded">
                      Executive Notice
                    </span>
                  </div>
                ) : !isMe ? (
                  <div className="flex items-center gap-1 text-[#128C7E] font-bold text-[11px] mb-1.5 select-none">
                    <span>{msg.senderName}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                      msg.senderRole === 'client' ? 'bg-emerald-50 text-emerald-800' : 'bg-sky-50 text-sky-800'
                    }`}>
                      {msg.senderRole === 'client' ? 'Client' : 'Senior Editor'}
                    </span>
                  </div>
                ) : null}

                {/* Voice note presentation */}
                {msg.isAudioNote ? (
                  <div className="flex items-center gap-2.5 py-1 min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                      className="w-8 h-8 rounded-full bg-[#128C7E] text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:bg-[#0d6e63] transition"
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1">
                      {/* Simulated Audio Waveform */}
                      <div className="flex items-center gap-0.5 h-5">
                        {[4, 8, 12, 16, 10, 14, 8, 12, 18, 14, 10, 6, 12, 16, 8, 4, 10, 14].map((h, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full transition-all ${
                              playingAudioId === msg.id ? 'bg-[#128C7E] animate-pulse' : 'bg-slate-400'
                            }`}
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {msg.audioDuration || '0:15'}
                      </div>
                    </div>
                  </div>
                ) : msg.attachmentName ? (
                  /* File / Video Attachment card */
                  <div className="space-y-1.5 my-0.5">
                    <div className="p-2 rounded-xl bg-black/5 flex items-center gap-2 border border-black/5">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#128C7E] shrink-0 shadow-xs">
                        {msg.attachmentType === 'video' ? (
                          <FileVideo className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 truncate text-[11px]">
                          {msg.attachmentName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {msg.attachmentSize || 'Rendered Draft'}
                        </div>
                      </div>
                      <a
                        href={project.deliveredVideoUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 transition"
                        title="Download attachment"
                      >
                        <Download className="w-3.5 h-3.5 text-[#128C7E]" />
                      </a>
                    </div>
                    <p className="text-slate-800 leading-relaxed break-words">{msg.text}</p>
                  </div>
                ) : (
                  /* Standard text message */
                  <p className="text-[#111B21] leading-relaxed break-words whitespace-pre-wrap">
                    {msg.text}
                  </p>
                )}

                {/* Compact Timestamp & WhatsApp Double Ticks Display */}
                <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-500 select-none">
                  {onDeleteMessage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this message?')) {
                          onDeleteMessage(project.id, msg.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-500" />
                    </button>
                  )}
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <span className="inline-flex items-center ml-0.5" title={
                      msg.status === 'sent' 
                        ? 'Sent (Single grey tick)' 
                        : msg.status === 'delivered' 
                        ? 'Delivered (Double grey tick)' 
                        : 'Seen / Read (Double blue tick)'
                    }>
                      {msg.status === 'sent' ? (
                        <Check className="w-3.5 h-3.5 text-slate-400 stroke-[2.2]" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-slate-400 stroke-[2.2]" />
                      ) : (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] stroke-[2.2]" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. WHATSAPP EMOJI & ATTACHMENT QUICK POPUPS */}
      {showEmojiPicker && (
        <div className="bg-white border-t border-slate-200 p-2.5 flex items-center justify-around gap-1 text-lg z-20">
          {['🔥', '👍', '🎬', '✨', '🚀', '✂️', '👏', '💯', '⏱️', '🎯', '💡', '❤️'].map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => handleQuickEmoji(em)}
              className="p-1 hover:scale-125 transition-transform cursor-pointer"
            >
              {em}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(false)}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showAttachMenu && (
        <div className="bg-white border-t border-slate-200 p-3 grid grid-cols-3 gap-2 text-xs z-20">
          <button
            type="button"
            onClick={() => handleSendQuickAttachment('RoughCut_v1.mp4', '248 MB', 'video')}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-800 flex flex-col items-center gap-1.5 transition cursor-pointer"
          >
            <FileVideo className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-[11px]">Video Cut Draft</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendQuickAttachment('Client_Audio_Track.wav', '45 MB', 'document')}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-800 flex flex-col items-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-[11px]">Audio / SFX Stems</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendQuickAttachment('Color_LUT_Rec709.cube', '12 MB', 'document')}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-800 flex flex-col items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-[11px]">Color Palette LUT</span>
          </button>
        </div>
      )}

      {/* 4. AUTHENTIC WHATSAPP BOTTOM INPUT BAR */}
      <div className="bg-[#F0F2F5] px-3 py-2.5 flex items-center gap-2 border-t border-slate-300/70 shrink-0">
        
        {/* Emoji Icon */}
        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowAttachMenu(false);
          }}
          className={`p-2 rounded-full hover:bg-slate-200 transition cursor-pointer ${
            showEmojiPicker ? 'text-[#00A884]' : 'text-slate-500 hover:text-slate-700'
          }`}
          title="Add emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Paperclip Attachment Icon */}
        <button
          type="button"
          onClick={() => {
            setShowAttachMenu(!showAttachMenu);
            setShowEmojiPicker(false);
          }}
          className={`p-2 rounded-full hover:bg-slate-200 transition cursor-pointer ${
            showAttachMenu ? 'text-[#00A884]' : 'text-slate-500 hover:text-slate-700'
          }`}
          title="Attach draft cuts or project assets"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Main Text Input Pill */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentUserRole === 'admin'
                ? "Intervene as Studio Admin (Type message to client & editor)..."
                : "Type a message..."
            }
            className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-full pl-4 pr-10 py-2.5 focus:outline-none shadow-2xs border border-transparent focus:border-slate-300"
          />
        </div>

        {/* Voice Note Recording button / Indicator */}
        {inputText.trim().length === 0 ? (
          <button
            type="button"
            onClick={handleToggleVoiceRecord}
            className={`p-2.5 rounded-full transition cursor-pointer shadow-xs ${
              isRecordingAudio 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-[#00A884] hover:bg-[#008f70] text-white'
            }`}
            title={isRecordingAudio ? "Stop & Send Audio Note" : "Hold or Click to Record Audio Note"}
          >
            <Mic className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            className="p-2.5 rounded-full bg-[#00A884] hover:bg-[#008f70] text-white transition cursor-pointer shadow-xs hover:scale-105 active:scale-95"
            title="Send WhatsApp message"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        )}
      </div>

    </div>
  );
};
