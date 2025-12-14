
import React, { useState, useEffect, useRef } from 'react';
import { 
    getChats, saveChats, getUser, updateChat, 
    addMemberToGroup, removeMemberFromGroup, promoteToAdmin, demoteAdmin, promoteToModerator, demoteModerator, formatDisplayTime,
    unsendMessage, deleteMessageForUser, deleteConversation, leaveGroup, getSharedLinks, restoreMessage, equipBadge, getBadgeDetails, checkActionBadges, getCertificates, getCertificateById, addSystemMessage, toggleBlockUser,
    getSharedImages, getSharedFiles
} from '../services/dataService';
import { BADGES } from '../constants';
import { Conversation, Message, User, BadgeDef, Certificate } from '../types';
import { 
  FaPaperPlane, FaPaperclip, FaSearch, FaEllipsisV, 
  FaPlus, FaUsers, FaSmile, FaTimes, FaReply, FaThumbtack, FaTrash, FaCrown, FaUndo, FaLink, FaCalendar, FaMedal, FaInfoCircle, FaSignOutAlt, FaCamera, FaEdit, FaCertificate, FaShieldAlt, FaBan, FaImage, FaFile, FaFileAlt, FaDownload, FaPen, FaCheck, FaUpload, FaUserShield, FaMobileAlt, FaDesktop, FaChevronDown, FaChevronUp, FaSave, FaCheckDouble, FaCaretSquareLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import UserProfilePopup from '../components/UserProfilePopup';

const AVAILABLE_USERS = [
    { id: 'u2', name: 'Sarah Drasner', username: 'sarah_d', avatar: 'https://picsum.photos/seed/sarah/50/50', badgeTitle: 'Mastermind', status: 'Online' },
    { id: 'u3', name: 'Mike Smith', username: 'mike_code', avatar: 'https://picsum.photos/seed/mike/50/50', badgeTitle: 'Code Warrior', status: 'Busy' },
    { id: 'u4', name: 'Emily Rose', username: 'emily_r', avatar: 'https://picsum.photos/seed/emily/50/50', status: 'Offline' },
    { id: 'u5', name: 'David Lee', username: 'david_l', avatar: 'https://picsum.photos/seed/david/50/50', status: 'Online' },
];

const REACTIONS_LIST = ['❤️', '😂', '👍', '👎', '😢', '😡', '🔥'];
const EMOJIS = ['😀', '😂', '😍', '😎', '🤔', '👍', '👎', '🔥', '🎉', '❤️', '👀', '🚀', '💯', '💩', '🤡'];

const Toast: React.FC<{ message: string; visible: boolean; onUndo?: () => void }> = ({ message, visible, onUndo }) => (
    <div className={`fixed top-24 right-4 bg-white dark:bg-gray-800 border-l-4 border-primary-500 shadow-2xl p-4 rounded-lg flex items-center gap-3 transition-all duration-500 z-[100] transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="bg-primary-100 p-2 rounded-full text-primary-600"><FaPaperPlane /></div>
        <div>
            <h4 className="font-bold text-gray-800 dark:text-white text-sm">Notification</h4>
            <p className="text-gray-600 dark:text-gray-300 text-xs flex items-center gap-2">
                {message}
                {onUndo && (
                    <button onClick={onUndo} className="text-primary-600 font-bold underline hover:text-primary-800">
                        UNDO
                    </button>
                )}
            </p>
        </div>
    </div>
);

// Helper for file size
const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  
  // Pending File State
  const [pendingFile, setPendingFile] = useState<{file: File, url: string, type: 'image' | 'file', progress: number} | null>(null);

  // Mention State
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSearchText, setMentionSearchText] = useState(''); 

  // Search States
  const [chatListSearchTerm, setChatListSearchTerm] = useState('');
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);

  // Modals & Popovers
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [infoTab, setInfoTab] = useState<'media' | 'files' | 'links'>('media');
  const [isMembersExpanded, setIsMembersExpanded] = useState(false); 
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isBadgePickerOpen, setIsBadgePickerOpen] = useState(false);
  const [isTitlePickerOpen, setIsTitlePickerOpen] = useState(false);
  const [isCertificatePickerOpen, setIsCertificatePickerOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Avatar Modal & Cropper State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarUploadFile, setAvatarUploadFile] = useState<string | null>(null); // DataURL
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropperRef = useRef<HTMLDivElement>(null);

  // Image Editing State
  const [imageToEdit, setImageToEdit] = useState<{url: string, originalMsgId?: string} | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Typing Indicators
  const [typingUsers, setTypingUsers] = useState<{id: string, device: 'mobile' | 'desktop'}[]>([]);

  const [activeMessageIdForAction, setActiveMessageIdForAction] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveGroupConfirm, setShowLeaveGroupConfirm] = useState(false);
  const [blockFutureInvites, setBlockFutureInvites] = useState(false);

  // Message Context
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  // Notification
  const [toast, setToast] = useState<{ message: string; visible: boolean; onUndo?: () => void }>({ message: '', visible: false });

  // Create Group Form
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupAvatar, setNewGroupAvatar] = useState('');
  const [updateGroupAvatarUrl, setUpdateGroupAvatarUrl] = useState(''); // For editing group avatar via URL
  
  const [user, setUser] = useState(getUser());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const groupAvatarInputRef = useRef<HTMLInputElement>(null);
  const groupUpdateAvatarInputRef = useRef<HTMLInputElement>(null);
  const mentionInputRef = useRef<HTMLInputElement>(null);

  // Shared Content State
  const [sharedLinks, setSharedLinks] = useState<{ [date: string]: string[] }>({});
  const [sharedImages, setSharedImages] = useState<{ [date: string]: string[] }>({});
  const [sharedFiles, setSharedFiles] = useState<{ [date: string]: {name: string, url: string}[] }>({});

  useEffect(() => {
    const loadedChats = getChats();
    setChats(loadedChats);
    if (loadedChats.length > 0) setActiveChatId(loadedChats[0].id);
    setUser(getUser());
  }, []);

  useEffect(() => {
      if(activeChatId && !messageSearchTerm) scrollToBottom();
      if(activeChatId) {
          setSharedLinks(getSharedLinks(activeChatId));
          setSharedImages(getSharedImages(activeChatId));
          setSharedFiles(getSharedFiles(activeChatId));
          
          // Mock Typing Logic
          const randomTyper = setInterval(() => {
              if (Math.random() > 0.7 && activeChat?.isGroup) {
                  const randomUser = AVAILABLE_USERS[Math.floor(Math.random() * AVAILABLE_USERS.length)];
                  const device = Math.random() > 0.5 ? 'mobile' : 'desktop';
                  setTypingUsers([{ id: randomUser.id, device }]);
                  setTimeout(() => setTypingUsers([]), 3000);
              }
          }, 8000);
          return () => clearInterval(randomTyper);
      }
  }, [activeChatId, chats]);

  // Fake Progress for File Upload
  useEffect(() => {
      if (pendingFile && pendingFile.progress < 100) {
          const timer = setInterval(() => {
              setPendingFile(prev => {
                  if (!prev) return null;
                  const newProgress = prev.progress + 20;
                  if (newProgress >= 100) {
                      clearInterval(timer);
                      return { ...prev, progress: 100 };
                  }
                  return { ...prev, progress: newProgress };
              });
          }, 100);
          return () => clearInterval(timer);
      }
  }, [pendingFile]);

  useEffect(() => {
      if (isMessageSearchOpen && searchInputRef.current) {
          searchInputRef.current.focus();
      }
  }, [isMessageSearchOpen]);

  useEffect(() => {
      if (showMentions && mentionInputRef.current) {
          mentionInputRef.current.focus();
      }
  }, [showMentions]);

  // Canvas Drawing Logic (Highlight)
  useEffect(() => {
      if (imageToEdit && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = imageToEdit.url;
          img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              if (ctx) ctx.drawImage(img, 0, 0);
          };
      }
  }, [imageToEdit]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          ctx.beginPath();
          ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
      }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
          ctx.stroke();
      }
  };

  const stopDrawing = () => {
      setIsDrawing(false);
  };

  const handleEditedImageAction = (action: 'send_new' | 'replace') => {
      if (canvasRef.current && imageToEdit) {
          const dataUrl = canvasRef.current.toDataURL('image/png');
          
          if (action === 'send_new') {
              handleSendMessage('Edited Image', 'image', dataUrl);
          } else {
              // Replace logic
              if (activeChatId && imageToEdit.originalMsgId) {
                  const updatedChats = chats.map(c => {
                      if (c.id === activeChatId) {
                          const updatedMsgs = c.messages.map(m => {
                              if (m.id === imageToEdit.originalMsgId) {
                                  return { ...m, fileUrl: dataUrl, text: 'Image edited' };
                              }
                              return m;
                          });
                          return { ...c, messages: updatedMsgs };
                      }
                      return c;
                  });
                  setChats(updatedChats);
                  saveChats(updatedChats);
              }
          }
          setImageToEdit(null);
      }
  };

  // --- CROPPER LOGIC ---
  const handleCropMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
          e.preventDefault();
          setCropOffset({
              x: e.clientX - dragStart.x,
              y: e.clientY - dragStart.y
          });
      }
  };

  const handleCropMouseUp = () => {
      setIsDragging(false);
  };

  const handleSaveCroppedAvatar = () => {
      if (avatarUploadFile) {
          const img = new Image();
          img.src = avatarUploadFile;
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const size = 200; 
              canvas.width = size;
              canvas.height = size;
              
              if (ctx) {
                  // Circular Clipping Path
                  ctx.beginPath();
                  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
                  ctx.clip();

                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, size, size);
                  
                  const ratio = 200 / 256;

                  ctx.translate(size/2, size/2);
                  ctx.scale(cropZoom, cropZoom);
                  ctx.translate(-size/2, -size/2);
                  ctx.translate(cropOffset.x * ratio, cropOffset.y * ratio);
                  
                  const drawnWidth = 200;
                  const drawnHeight = 200 * (img.height / img.width);
                  const yOffset = (200 - drawnHeight) / 2;

                  ctx.drawImage(img, 0, yOffset, drawnWidth, drawnHeight);
                  
                  const dataUrl = canvas.toDataURL('image/png');
                  if(activeChat) {
                      const updated = updateChat({...activeChat, avatar: dataUrl});
                      // Add System Message for Avatar Change
                      const chatsWithMsg = addSystemMessage(activeChat.id, `${user.name} changed the group photo`);
                      setChats(chatsWithMsg);
                  }
                  setAvatarUploadFile(null);
                  setIsAvatarModalOpen(false);
                  setCropZoom(1);
                  setCropOffset({x:0, y:0});
              }
          };
      }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const scrollToMessage = (msgId: string) => {
      const el = document.getElementById(`msg-${msgId}`);
      if(el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('bg-yellow-100', 'transition-colors', 'duration-1000');
          setTimeout(() => el.classList.remove('bg-yellow-100'), 1500);
      }
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  const isAdmin = activeChat?.isGroup && activeChat.admins?.includes(user.id);
  const isModerator = activeChat?.isGroup && activeChat.moderators?.includes(user.id);
  const isCreator = activeChat?.isGroup && activeChat.participants[0] === user.id;
  
  const otherParticipantId = !activeChat?.isGroup && activeChat ? activeChat.participants.find(p => p !== user.id) : null;
  const isBlocked = otherParticipantId && user.blockedUsers?.includes(otherParticipantId);
  const otherParticipant = otherParticipantId ? AVAILABLE_USERS.find(u => u.id === otherParticipantId) : null;

  const showToast = (msg: string, onUndo?: () => void) => {
      setToast({ message: msg, visible: true, onUndo });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputText(val);
      
      const lastAt = val.lastIndexOf('@');
      if (lastAt !== -1) {
          const query = val.substring(lastAt + 1);
          if (!query.includes(' ')) {
              setMentionQuery(query);
              setMentionSearchText(query); 
              setShowMentions(true);
          } else {
              setShowMentions(false);
          }
      } else {
          setShowMentions(false);
      }
  };

  const insertMention = (username: string) => {
      const lastAt = inputText.lastIndexOf('@');
      const prefix = inputText.substring(0, lastAt);
      setInputText(`${prefix}@${username} `);
      setShowMentions(false);
      setMentionSearchText('');
  };

  const handleSendMessage = (text?: string, type: 'text' | 'badge' | 'certificate' | 'image' | 'file' = 'text', data?: any) => {
    if (isBlocked) return; 
    
    // Handle Pending File Sending
    if (pendingFile && type === 'text') {
        type = pendingFile.type;
        data = pendingFile.url;
        text = pendingFile.file.name;
    }

    const content = text !== undefined ? text : inputText;
    if ((!content.trim() && type === 'text') || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      text: content,
      time: new Date().toISOString(),
      type: type,
      badgeData: type === 'badge' ? data : undefined,
      certificateId: type === 'certificate' ? data : undefined,
      fileUrl: (type === 'image' || type === 'file') ? data : undefined,
      reactions: {},
      replyToId: replyingTo?.id,
      replyToText: replyingTo?.text
    };

    const updatedChats = chats.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: type === 'badge' ? 'Shared a badge' : type === 'certificate' ? 'Shared a certificate' : type === 'image' ? 'Sent an image' : type === 'file' ? 'Sent a file' : content,
          time: 'Now'
        };
      }
      return chat;
    });

    setChats(updatedChats);
    saveChats(updatedChats);
    setInputText('');
    setPendingFile(null); // Clear pending file
    setReplyingTo(null);
    setIsBadgePickerOpen(false);
    setIsCertificatePickerOpen(false);
    setIsEmojiPickerOpen(false);
    checkActionBadges('time'); 
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          setPendingFile({
              file: file,
              url: url,
              type: type,
              progress: 0
          });
      }
      // Reset input
      e.target.value = '';
  };

  const handleGroupAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          setNewGroupAvatar(url);
      }
  }

  const handleUpdateGroupAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          const reader = new FileReader();
          reader.onload = () => {
              if (typeof reader.result === 'string') {
                  setAvatarUploadFile(reader.result);
                  setUpdateGroupAvatarUrl(''); // Clear URL if file selected
              }
          };
          reader.readAsDataURL(file);
      }
  }

  const insertEmoji = (emoji: string) => {
      setInputText(prev => prev + emoji);
      setIsEmojiPickerOpen(false);
  };

  const handleEquipBadge = (badgeId: string) => {
      const updatedUser = equipBadge(badgeId);
      setUser(updatedUser);
      setIsTitlePickerOpen(false);
      showToast(`Equipped badge: ${badgeId}`);
  };

  const handleCreateGroup = () => {
      if(!newGroupName) return;
      const newChat: Conversation = {
          id: Date.now().toString(),
          isGroup: true,
          name: newGroupName,
          avatar: newGroupAvatar || 'https://picsum.photos/seed/group/50/50',
          participants: [user.id],
          admins: [user.id],
          lastMessage: 'Group created',
          unreadCount: 0,
          time: 'Now',
          messages: []
      };
      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      saveChats(updatedChats);
      setActiveChatId(newChat.id);
      setIsGroupModalOpen(false);
      setNewGroupName('');
      setNewGroupAvatar('');
  };

  const handleReaction = (messageId: string, emoji: string) => {
      const updatedChats = chats.map(chat => {
          if (chat.id === activeChatId) {
              const updatedMessages = chat.messages.map(m => {
                  if (m.id === messageId) {
                      const reactions = m.reactions || {};
                      reactions[emoji] = (reactions[emoji] || 0) + 1;
                      return { ...m, reactions };
                  }
                  return m;
              });
              return { ...chat, messages: updatedMessages };
          }
          return chat;
      });
      setChats(updatedChats);
      saveChats(updatedChats);
      setActiveMessageIdForAction(null);
  }

  // ... Handlers for pin, unsend, delete, group actions ...
  const handlePinMessage = (messageId: string) => {
       const updatedChats = chats.map(chat => {
          if (chat.id === activeChatId) {
              const currentPins = chat.messages.filter(m => m.isPinned).length;
              const targetMessage = chat.messages.find(m => m.id === messageId);
              
              const updatedMessages = chat.messages.map(m => {
                  if (m.id === messageId) {
                      return { ...m, isPinned: !m.isPinned };
                  }
                  return m;
              });
              
              const newPinCount = updatedMessages.filter(m => m.isPinned).length;
              if (targetMessage && !targetMessage.isPinned && newPinCount > 5) {
                   alert("You can only pin up to 5 messages.");
                   return chat;
              }

              return { ...chat, messages: updatedMessages };
          }
          return chat;
      });
      setChats(updatedChats);
      saveChats(updatedChats);
      setActiveMessageIdForAction(null);
  };

  const handleUnsend = (messageId: string) => {
      if (activeChatId) {
          const updated = unsendMessage(activeChatId, messageId);
          setChats([...updated]);
          setActiveMessageIdForAction(null);
          showToast("Message unsent.", () => {
               const restored = restoreMessage(activeChatId, messageId);
               setChats([...restored]);
               setToast(prev => ({ ...prev, visible: false }));
          });
      }
  };

  const handleDeleteForMe = (messageId: string) => {
      if (activeChatId) {
          const updated = deleteMessageForUser(activeChatId, messageId, user.id);
          setChats([...updated]);
          setActiveMessageIdForAction(null);
      }
  };

  const handleDeleteChat = () => {
      if (activeChatId) {
          const updated = deleteConversation(activeChatId);
          setChats([...updated]);
          setShowDeleteConfirm(false);
          setActiveChatId(updated.length > 0 ? updated[0].id : '');
      }
  };

  const handleLeaveGroup = () => {
      if (activeChatId) {
          const updated = leaveGroup(activeChatId, user.id);
          setChats([...updated]);
          setShowLeaveGroupConfirm(false);
          if(updated.length > 0) {
              setActiveChatId(updated[0].id);
          } else {
              setActiveChatId('');
          }
      }
  };

  const handleAddMember = (userId: string) => {
      if(activeChatId) {
          const updated = addMemberToGroup(activeChatId, userId, user.name);
          setChats([...updated]);
          setIsAddMemberOpen(false);
      }
  };

  const handleRemoveMember = (userId: string) => {
       if(activeChatId) {
          const updated = removeMemberFromGroup(activeChatId, userId, user.name);
          setChats([...updated]);
      }
  };

  const handlePromoteAdmin = (userId: string) => {
       if(activeChatId) {
          const updated = promoteToAdmin(activeChatId, userId, user.name);
          setChats([...updated]);
      }
  };

  const handleDemoteAdmin = (userId: string) => {
      if(activeChatId) {
          const updated = demoteAdmin(activeChatId, userId, user.name);
          setChats([...updated]);
      }
  };

  const handlePromoteModerator = (userId: string) => {
      if(activeChatId) {
          const updated = promoteToModerator(activeChatId, userId, user.name);
          setChats([...updated]);
      }
  };

  const handleDemoteModerator = (userId: string) => {
      if(activeChatId) {
          const updated = demoteModerator(activeChatId, userId, user.name);
          setChats([...updated]);
      }
  };
  
  const handleSaveGroupAvatar = () => {
      if(activeChat && activeChat.isGroup) {
          let newAvatar = activeChat.avatar;
          if (updateGroupAvatarUrl) newAvatar = updateGroupAvatarUrl;
          
          if(updateGroupAvatarUrl) {
              const updated = updateChat({...activeChat, avatar: newAvatar});
              const chatsWithMsg = addSystemMessage(activeChat.id, `${user.name} changed the group photo`);
              setChats(chatsWithMsg);
          }
          setIsAvatarModalOpen(false);
          setUpdateGroupAvatarUrl('');
          setAvatarUploadFile(null);
      }
  }

  const handleBlockUser = () => {
      if (otherParticipantId) {
          const updatedUser = toggleBlockUser(otherParticipantId);
          setUser(updatedUser);
          showToast(isBlocked ? "User unblocked" : "User blocked");
      }
  }

  const filteredChats = chats.filter(c => 
      c.name.toLowerCase().includes(chatListSearchTerm.toLowerCase())
  );

  const displayedMessages = activeChat?.messages.filter(m => !m.deletedFor?.includes(user.id)) || [];
  
  const pinnedMessages = displayedMessages.filter(m => m.isPinned); 

  const getUserBadge = (userId: string) => {
      if (userId === user.id) return user.equippedBadge ? getBadgeDetails(user.equippedBadge) : null;
      const otherUser = AVAILABLE_USERS.find(u => u.id === userId);
      if (otherUser && otherUser.badgeTitle) return BADGES.find(b => b.name === otherUser.badgeTitle);
      return null;
  }

  // --- Enhanced Grouping & Style Logic ---
  const getBubbleStyles = (isMe: boolean, isFirstInGroup: boolean, isLastInGroup: boolean) => {
      const baseClass = "px-4 py-2 shadow-sm text-sm relative break-words w-fit";
      
      if (isMe) {
          // 'Me' Bubbles
          let radiusClass = "rounded-2xl";
          if (!isFirstInGroup && !isLastInGroup) radiusClass = "rounded-2xl rounded-r-md mb-0.5"; // Middle
          else if (isFirstInGroup && !isLastInGroup) radiusClass = "rounded-2xl rounded-br-md mb-0.5"; // First
          else if (!isFirstInGroup && isLastInGroup) radiusClass = "rounded-2xl rounded-tr-md"; // Last
          
          return `${baseClass} ${radiusClass} bg-primary-600 text-white`;
      } else {
          // 'Other' Bubbles
          let radiusClass = "rounded-2xl";
          if (!isFirstInGroup && !isLastInGroup) radiusClass = "rounded-2xl rounded-l-md mb-0.5"; // Middle
          else if (isFirstInGroup && !isLastInGroup) radiusClass = "rounded-2xl rounded-bl-md mb-0.5"; // First
          else if (!isFirstInGroup && isLastInGroup) radiusClass = "rounded-2xl rounded-tl-md"; // Last

          return `${baseClass} ${radiusClass} bg-white border border-gray-200 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`;
      }
  };

  const getMyCertificates = () => {
      const allCerts = getCertificates();
      return allCerts.filter(c => user.certificates.includes(c.id));
  };

  const filteredUsersForMention = AVAILABLE_USERS.filter(u => 
      u.name.toLowerCase().includes(mentionSearchText.toLowerCase()) || 
      u.username.toLowerCase().includes(mentionSearchText.toLowerCase()) ||
      u.id.toLowerCase().includes(mentionSearchText.toLowerCase())
  );

  const renderMessageContent = (text: string) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = text.split(urlRegex);
      return parts.map((part, i) => {
          if (part.match(urlRegex)) {
              return (
                  <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all" onClick={(e) => e.stopPropagation()}>
                      {part}
                  </a>
              );
          }
          return part;
      });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in relative">
      <Toast message={toast.message} visible={toast.visible} onUndo={toast.onUndo} />
      
      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'file')} />
      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} />

      {/* Sidebar List */}
      <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col z-20 bg-white dark:bg-gray-800 shrink-0">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-white">Messages</h2>
            <button onClick={() => setIsGroupModalOpen(true)} className="text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 p-2 rounded-full"><FaPlus /></button>
        </div>
        <div className="p-2">
            <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search chats..." 
                    className="w-full bg-gray-50 dark:bg-gray-700 dark:text-white pl-10 pr-4 py-2 rounded-xl text-sm outline-none focus:outline-none" 
                    value={chatListSearchTerm}
                    onChange={e => setChatListSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto">
            {filteredChats.map(chat => (
                <div 
                    key={chat.id} 
                    onClick={() => setActiveChatId(chat.id)}
                    className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700 ${activeChatId === chat.id ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    <div className="relative">
                        <img src={chat.avatar} className="w-12 h-12 rounded-full object-cover" alt={chat.name} />
                        {!chat.isGroup && chat.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className={`font-semibold truncate ${activeChatId === chat.id ? 'text-primary-900 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>{chat.name}</h4>
                            <span className="text-xs text-gray-400">{chat.time}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
          <div className="flex-1 flex flex-col w-full min-w-0 bg-gray-50/50 dark:bg-gray-900 relative">
              {/* Chat Header */}
              <div className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6 z-30 relative shadow-sm shrink-0">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsGroupInfoOpen(!isGroupInfoOpen)}>
                      <img src={activeChat.avatar} className="w-10 h-10 rounded-full" alt={activeChat.name} />
                      <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
                              {activeChat.name}
                              {isBlocked && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">BLOCKED</span>}
                          </h3>
                          
                          {activeChat.isGroup ? (
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><FaUsers /> {activeChat.participants.length} members</p>
                          ) : (
                              // Personal Chat: Show @username
                              <div className="flex flex-col">
                                  <span className="text-[10px] text-gray-400 font-mono">@{otherParticipant?.username || 'unknown'}</span>
                              </div>
                          )}
                      </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-300">
                      
                      {/* Status indicator moved here */}
                      {!activeChat.isGroup && otherParticipant && (
                          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                              otherParticipant.status === 'Online' 
                                ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                                : otherParticipant.status === 'Busy' 
                                    ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' 
                                    : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                          }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                  otherParticipant.status === 'Online' ? 'bg-green-500' : otherParticipant.status === 'Busy' ? 'bg-red-500' : 'bg-gray-400'
                              }`}></div>
                              {otherParticipant.status || 'Offline'}
                          </div>
                      )}

                      <div className={`flex items-center transition-all duration-300 overflow-hidden ${isMessageSearchOpen ? 'w-full md:w-60 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1' : 'w-8'}`}>
                         <FaSearch 
                            className={`cursor-pointer min-w-[20px] ${isMessageSearchOpen ? 'text-gray-500' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`} 
                            onClick={() => { 
                                if (!isMessageSearchOpen) setIsMessageSearchOpen(true);
                            }}
                         />
                         {isMessageSearchOpen && (
                             <>
                                <input 
                                    ref={searchInputRef}
                                    type="text"
                                    className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full ml-2 dark:text-white"
                                    placeholder="Find..."
                                    value={messageSearchTerm}
                                    onChange={(e) => setMessageSearchTerm(e.target.value)}
                                    onBlur={() => { if(!messageSearchTerm) setIsMessageSearchOpen(false); }}
                                />
                                <FaTimes 
                                    className="cursor-pointer text-gray-400 hover:text-gray-600 ml-2" 
                                    onClick={() => { setIsMessageSearchOpen(false); setMessageSearchTerm(''); }}
                                />
                             </>
                         )}
                      </div>

                      <button 
                          onClick={() => setIsGroupInfoOpen(!isGroupInfoOpen)}
                          className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white transition-colors"
                          title="Chat Info"
                      >
                          <FaCaretSquareLeft size={24} />
                      </button>
                  </div>
              </div>

              {/* Pinned Messages */}
              {pinnedMessages.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/50 p-2 z-20 shadow-sm flex items-center gap-3 overflow-x-auto whitespace-nowrap shrink-0">
                      <div className="text-yellow-600 dark:text-yellow-400 text-xs font-bold flex flex-col items-center px-2 border-r border-yellow-200 dark:border-yellow-800">
                           <FaThumbtack />
                           <span>{pinnedMessages.length}/5</span>
                      </div>
                      <div className="flex gap-2">
                          {pinnedMessages.map(msg => {
                              const senderName = msg.senderId === user.id ? 'You' : AVAILABLE_USERS.find(u => u.id === msg.senderId)?.name || 'User';
                              return (
                                  <div 
                                    key={msg.id} 
                                    onClick={() => scrollToMessage(msg.id)}
                                    className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-1 text-xs cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/40 flex items-center gap-2 max-w-[200px]"
                                  >
                                      <span className="font-bold text-gray-700 dark:text-gray-300">{senderName}:</span>
                                      <span className="truncate text-gray-500 dark:text-gray-400">{msg.text}</span>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              )}

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 z-0 relative">
                  {displayedMessages.map((msg, idx) => {
                      if (msg.type === 'system') {
                          return (
                              <div key={idx} className="flex justify-center my-4">
                                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded-full font-medium shadow-sm border border-gray-300 dark:border-gray-600 italic">
                                      {msg.text}
                                  </span>
                              </div>
                          );
                      }

                      const isMe = msg.senderId === user.id;
                      const isMatched = messageSearchTerm && msg.text.toLowerCase().includes(messageSearchTerm.toLowerCase());
                      const isUnsent = msg.isUnsent;
                      const senderBadge = getUserBadge(msg.senderId);
                      
                      const prevMsg = idx > 0 ? displayedMessages[idx - 1] : undefined;
                      const nextMsg = idx < displayedMessages.length - 1 ? displayedMessages[idx + 1] : undefined;
                      
                      // Check connectivity for grouping
                      const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId || prevMsg.type === 'system';
                      const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || nextMsg.type === 'system';

                      const bubbleClass = getBubbleStyles(isMe, isFirstInGroup, isLastInGroup);

                      // Logic for Seen Status (Only on the absolute last message if it is from 'Me')
                      const isLastMessageGlobal = idx === displayedMessages.length - 1;
                      const showSeen = isLastMessageGlobal && isMe && !activeChat.isGroup;

                      let certificateData: Certificate | undefined;
                      if(msg.type === 'certificate' && msg.certificateId) {
                          certificateData = getCertificateById(msg.certificateId);
                      }

                      return (
                          <div id={`msg-${msg.id}`} key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group transition-opacity animate-slide-up ${messageSearchTerm && !isMatched ? 'opacity-30' : 'opacity-100'} ${!isFirstInGroup ? 'mt-0' : 'mt-3'}`} onMouseLeave={() => setActiveMessageIdForAction(null)}>
                              
                              <div className={`flex max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-2 items-end`}>
                                  {!isMe && (
                                      <div className="w-8 flex-shrink-0 mb-0.5 cursor-pointer" onClick={() => setSelectedUserProfile({id: msg.senderId, name: 'User', avatar: activeChat.avatar})}>
                                          {isLastInGroup ? (
                                              <img src={activeChat.avatar} className="w-8 h-8 rounded-full" alt="" />
                                          ) : <div className="w-8"></div>}
                                      </div>
                                  )}
                                  
                                  <div className={`relative flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
                                      {/* Show sender name only on first message of group in group chats */}
                                      {!isMe && activeChat.isGroup && isFirstInGroup && (
                                          <div className="ml-1 mb-1">
                                              <span className="text-xs text-gray-500 font-bold block dark:text-gray-400 cursor-pointer hover:underline" onClick={() => setSelectedUserProfile({id: msg.senderId, name: 'User', avatar: activeChat.avatar})}>{AVAILABLE_USERS.find(u => u.id === msg.senderId)?.name || 'User'}</span>
                                              {senderBadge && (
                                                  <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-yellow-200 mt-0.5 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                                                      {senderBadge.icon} {senderBadge.name}
                                                  </span>
                                              )}
                                          </div>
                                      )}

                                      <div 
                                        className={`${bubbleClass}
                                            ${isUnsent ? 'bg-gray-200 text-gray-500 border border-gray-300 italic dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600' : ''}
                                            ${msg.isPinned ? 'border-2 border-yellow-400' : ''}
                                            ${msg.type === 'badge' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-100 dark:border-yellow-800' : ''}
                                            ${msg.type === 'certificate' ? 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 text-gray-800 w-64 dark:from-gray-700 dark:to-gray-600 dark:text-gray-100 dark:border-gray-500' : ''}
                                            ${msg.type === 'image' ? 'p-1 bg-transparent border-0 shadow-none' : ''}
                                        `}
                                        onMouseEnter={() => !isUnsent && setActiveMessageIdForAction(msg.id)}
                                      >
                                          {msg.replyToText && !isUnsent && (
                                              <div 
                                                onClick={() => msg.replyToId && scrollToMessage(msg.replyToId)}
                                                className={`text-xs p-1 mb-1 rounded bg-black/10 truncate cursor-pointer hover:opacity-80 flex items-center gap-1`}
                                              >
                                                  <FaReply size={8} /> {msg.replyToText}
                                              </div>
                                          )}

                                          {isUnsent ? 'Message unsent' : (
                                              msg.type === 'badge' && msg.badgeData ? (
                                                  <div className="text-center p-2">
                                                      <div className="text-4xl mb-1">{msg.badgeData.icon}</div>
                                                      <div className="font-bold text-yellow-800 dark:text-yellow-400">{msg.badgeData.name}</div>
                                                      <div className="text-xs text-gray-500 dark:text-gray-400 italic">{msg.badgeData.description}</div>
                                                  </div>
                                              ) : msg.type === 'certificate' && certificateData ? (
                                                  <div className="cursor-pointer" onClick={() => navigate(`/certificate/${certificateData?.id}`)}>
                                                      <div className="flex items-center gap-2 mb-2 border-b border-gray-200 dark:border-gray-500 pb-2">
                                                          <FaCertificate className="text-yellow-600 text-lg" />
                                                          <span className="font-bold text-xs uppercase tracking-wide text-yellow-700 dark:text-yellow-400">Certificate Earned</span>
                                                      </div>
                                                      <div className="text-center py-2">
                                                          <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight mb-1">{certificateData.courseName}</h4>
                                                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Awarded to {certificateData.studentName}</p>
                                                          <p className="text-[9px] text-gray-400 mt-1">{certificateData.issueDate}</p>
                                                      </div>
                                                      <div className="mt-1 flex justify-center">
                                                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Score: {certificateData.score.toFixed(0)}%</span>
                                                      </div>
                                                  </div>
                                              ) : msg.type === 'image' ? (
                                                  <div className="relative group/image">
                                                      <img 
                                                        src={msg.fileUrl} 
                                                        alt="Shared" 
                                                        className="rounded-xl max-w-[200px] md:max-w-xs cursor-pointer hover:opacity-90"
                                                        onClick={() => setPreviewImage(msg.fileUrl || null)}
                                                      />
                                                      {/* Highlight Button */}
                                                      <button 
                                                          onClick={() => setImageToEdit({url: msg.fileUrl || '', originalMsgId: msg.id})}
                                                          className="absolute top-2 right-2 bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-gray-100"
                                                          title="Highlight"
                                                      >
                                                          <FaPen size={12} />
                                                      </button>
                                                  </div>
                                              ) : msg.type === 'file' ? (
                                                  <div className="flex items-center gap-3 p-1 min-w-[200px]">
                                                      <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-lg">
                                                          <FaFileAlt className="text-primary-500 text-xl" />
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                          <p className="font-bold text-sm truncate dark:text-white">{msg.text}</p>
                                                          <p className="text-[10px] text-gray-500 dark:text-gray-300">File</p>
                                                      </div>
                                                      <a href={msg.fileUrl} download={msg.text} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                          <FaDownload />
                                                      </a>
                                                  </div>
                                              ) : (
                                                <div className="flex items-end gap-2 flex-wrap">
                                                    <span className="whitespace-pre-wrap">{renderMessageContent(msg.text)}</span>
                                                    <span className={`text-[9px] ${isMe ? 'text-primary-100' : 'text-gray-400'} ml-auto select-none opacity-80 flex items-center gap-1`}>
                                                        {formatDisplayTime(msg.time)}
                                                        {isMe && <FaCheckDouble className="text-[10px]" />}
                                                    </span>
                                                </div>
                                              )
                                          )}
                                      </div>
                                      
                                      {activeMessageIdForAction === msg.id && (
                                          <div className={`absolute top-0 -translate-y-full ${isMe ? 'right-0' : 'left-0'} bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-1 p-1 border border-gray-100 dark:border-gray-700 z-50`}>
                                              {REACTIONS_LIST.map(emoji => (
                                                  <button key={emoji} onClick={() => handleReaction(msg.id, emoji)} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-transform hover:scale-125">{emoji}</button>
                                              ))}
                                              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                                              <button onClick={() => { setReplyingTo(msg); setActiveMessageIdForAction(null); }} className="text-gray-500 hover:text-primary-600 p-1" title="Reply"><FaReply /></button>
                                              <button onClick={() => handlePinMessage(msg.id)} className="text-gray-500 hover:text-yellow-500 p-1" title="Pin"><FaThumbtack /></button>
                                              
                                              <div className="relative group/more">
                                                  <button className="text-gray-500 hover:text-gray-800 dark:hover:text-white p-1"><FaEllipsisV /></button>
                                                  <div className="absolute top-full right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg py-1 w-32 hidden group-hover/more:block z-30">
                                                      {isMe && <button onClick={() => handleUnsend(msg.id)} className="block w-full text-left px-3 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-orange-600"><FaUndo className="inline mr-1"/> Unsend</button>}
                                                      <button onClick={() => handleDeleteForMe(msg.id)} className="block w-full text-left px-3 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600"><FaTrash className="inline mr-1"/> Delete for me</button>
                                                  </div>
                                              </div>
                                          </div>
                                      )}

                                      {msg.reactions && Object.keys(msg.reactions).length > 0 && !isUnsent && (
                                          <div className={`absolute -bottom-3 ${isMe ? 'left-0' : 'right-0'} bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-full px-1.5 py-0.5 flex shadow-sm text-xs z-10 scale-90`}>
                                              {Object.keys(msg.reactions).map(emoji => <span key={emoji} className="mr-0.5 dark:text-white">{emoji} {msg.reactions![emoji] > 1 ? msg.reactions![emoji] : ''}</span>)}
                                          </div>
                                      )}
                                  </div>
                              </div>
                              {/* Seen Avatar Indicator */}
                              {showSeen && (
                                  <div className="flex justify-end mt-1 mr-1 animate-fade-in">
                                      <img src={activeChat.avatar} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" alt="Seen" title="Seen" />
                                  </div>
                              )}
                          </div>
                      );
                  })}
                  <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                  <div className="absolute bottom-20 left-6 z-20 flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 animate-slide-up">
                      <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                      </span>
                      {AVAILABLE_USERS.find(u => u.id === typingUsers[0].id)?.name} is typing...
                      {typingUsers[0].device === 'mobile' ? <FaMobileAlt className="ml-1" /> : <FaDesktop className="ml-1" />}
                  </div>
              )}

              {/* Chat Input */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10 relative shrink-0">
                  {replyingTo && (
                      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-lg mb-2 border-l-4 border-primary-500 text-sm">
                          <div className="cursor-pointer" onClick={() => scrollToMessage(replyingTo.id)}>
                              <span className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1"><FaReply /> Replying to message</span>
                              <p className="text-gray-500 dark:text-gray-400 truncate">{replyingTo.text}</p>
                          </div>
                          <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-red-500"><FaTimes /></button>
                      </div>
                  )}

                  {/* Pending File Preview */}
                  {pendingFile && (
                      <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center gap-3 relative animate-slide-up">
                          <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg">
                              {pendingFile.type === 'image' ? <FaImage className="text-purple-500" /> : <FaFile className="text-blue-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{pendingFile.file.name}</p>
                              {pendingFile.progress < 100 ? (
                                  <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-500 rounded-full overflow-hidden">
                                          <div className="h-full bg-primary-500 transition-all duration-200" style={{ width: `${pendingFile.progress}%` }}></div>
                                      </div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Uploading...</span>
                                  </div>
                              ) : (
                                  <div className="flex items-center gap-2">
                                       <span className="text-xs text-green-600 font-bold flex items-center gap-1"><FaCheck /> Ready</span>
                                       <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">({formatBytes(pendingFile.file.size)})</span>
                                  </div>
                              )}
                          </div>
                          <button onClick={() => setPendingFile(null)} className="text-gray-400 hover:text-red-500 p-1">
                              <FaTimes />
                          </button>
                      </div>
                  )}
                  
                  {/* Mentions Dropdown */}
                  {showMentions && (
                      <div className="absolute bottom-full left-16 mb-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-600 z-50 w-64 overflow-hidden">
                          <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-xs text-gray-500 dark:text-gray-300 font-bold uppercase border-b dark:border-gray-600">
                              <input 
                                  ref={mentionInputRef}
                                  type="text" 
                                  className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-800 dark:text-white"
                                  placeholder="Search user..."
                                  value={mentionSearchText}
                                  onChange={(e) => setMentionSearchText(e.target.value)}
                              />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                              {filteredUsersForMention.length > 0 ? filteredUsersForMention.map(u => (
                                  <div key={u.id} onClick={() => insertMention(u.username)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 transition-colors">
                                      <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                      <div>
                                          <p className="text-sm font-bold text-gray-800 dark:text-white">{u.name}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</p>
                                      </div>
                                  </div>
                              )) : (
                                  <p className="p-2 text-xs text-gray-400 text-center">No users found.</p>
                              )}
                          </div>
                      </div>
                  )}

                  {isBadgePickerOpen && (
                      <div className="absolute bottom-full left-4 mb-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 p-3 w-64 z-20">
                          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Share a Badge</h4>
                          <div className="grid grid-cols-3 gap-2">
                              {user.badges.map(bId => {
                                  const badge = getBadgeDetails(bId);
                                  if (!badge) return null;
                                  return (
                                      <div key={bId} onClick={() => handleSendMessage('', 'badge', badge)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                                          <span className="text-2xl">{badge.icon}</span>
                                          <span className="text-[10px] truncate w-full text-center dark:text-gray-300">{badge.name}</span>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  )}

                  {isCertificatePickerOpen && (
                      <div className="absolute bottom-full left-12 mb-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 p-3 w-64 z-20">
                          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Share a Certificate</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                              {getMyCertificates().length > 0 ? getMyCertificates().map(cert => (
                                  <div 
                                    key={cert.id} 
                                    onClick={() => handleSendMessage('', 'certificate', cert.id)}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded border border-gray-100 dark:border-gray-700 flex items-center gap-2"
                                  >
                                      <FaCertificate className="text-yellow-500 flex-shrink-0" />
                                      <div className="min-w-0">
                                          <p className="text-xs font-bold truncate dark:text-white">{cert.courseName}</p>
                                          <p className="text-[9px] text-gray-500 dark:text-gray-400">{cert.issueDate}</p>
                                      </div>
                                  </div>
                              )) : (
                                  <p className="text-xs text-gray-400 text-center italic py-2">No certificates earned yet.</p>
                              )}
                          </div>
                      </div>
                  )}

                  {isEmojiPickerOpen && (
                      <div className="absolute bottom-full right-4 mb-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 p-3 w-64 z-20">
                          <div className="grid grid-cols-5 gap-2">
                              {EMOJIS.map(emoji => (
                                  <button key={emoji} onClick={() => insertEmoji(emoji)} className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors">
                                      {emoji}
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}

                  <div className={`flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2 ${isBlocked ? 'opacity-50 pointer-events-none' : ''}`}>
                      <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Send File">
                          <FaPaperclip />
                      </button>
                      <button onClick={() => imageInputRef.current?.click()} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Send Image">
                          <FaImage />
                      </button>
                      <button onClick={() => { setIsBadgePickerOpen(!isBadgePickerOpen); setIsCertificatePickerOpen(false); setIsEmojiPickerOpen(false); }} className="text-yellow-500 hover:text-yellow-600" title="Share Badge">
                          <FaMedal />
                      </button>
                      <button onClick={() => { setIsCertificatePickerOpen(!isCertificatePickerOpen); setIsBadgePickerOpen(false); setIsEmojiPickerOpen(false); }} className="text-blue-500 hover:text-blue-600" title="Share Certificate">
                          <FaCertificate />
                      </button>
                      <input 
                          type="text" 
                          className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2 dark:text-white"
                          placeholder={isBlocked ? "You blocked this user." : "Type a message..."}
                          value={inputText}
                          onChange={handleInputChange}
                          disabled={isBlocked || false}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(undefined, 'text')}
                      />
                      <FaSmile 
                        className="text-gray-500 cursor-pointer hover:text-yellow-500 dark:text-gray-400" 
                        onClick={() => { setIsEmojiPickerOpen(!isEmojiPickerOpen); setIsBadgePickerOpen(false); setIsCertificatePickerOpen(false); }}
                      />
                      <button 
                        onClick={() => handleSendMessage(undefined, 'text')} 
                        className={`p-2 rounded-lg text-white transition-colors ${pendingFile && pendingFile.progress < 100 ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
                        disabled={!!pendingFile && pendingFile.progress < 100}
                      >
                          <FaPaperPlane size={14} />
                      </button>
                  </div>
              </div>

              {/* Sidebar Info */}
              <div className={`absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-40 flex flex-col transform transition-all duration-300 ease-in-out ${isGroupInfoOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
                  {/* ... same sidebar info content ... */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
                      <h3 className="font-bold text-gray-800 dark:text-white">{activeChat.isGroup ? 'Group Info' : 'Contact Info'}</h3>
                      <button onClick={() => setIsGroupInfoOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"><FaTimes /></button>
                  </div>
                  <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-700">
                       <div className="relative group cursor-pointer" onClick={() => (isAdmin || isModerator) && setIsAvatarModalOpen(true)}>
                            <img src={activeChat.avatar} className="w-24 h-24 rounded-full mb-3 shadow-md" alt="" />
                            {(isAdmin || isModerator) && (
                                <div className="absolute bottom-3 right-0 bg-white p-2 rounded-full shadow border border-gray-200 text-gray-600 hover:text-primary-600">
                                    <FaCamera size={14} />
                                </div>
                            )}
                       </div>
                       <h2 className="font-bold text-xl text-center text-gray-900 dark:text-white">{activeChat.name}</h2>
                       {activeChat.isGroup && <p className="text-sm text-gray-500 dark:text-gray-400">{activeChat.participants.length} members</p>}
                  </div>

                  {/* Storage Tabs - Hidden if Members Expanded */}
                  {!isMembersExpanded && (
                      <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto shrink-0">
                          <button 
                            onClick={() => setInfoTab('media')}
                            className={`flex-1 min-w-[70px] py-3 text-xs md:text-sm font-bold border-b-2 transition-colors ${infoTab === 'media' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                          >
                              Media
                          </button>
                          <button 
                            onClick={() => setInfoTab('files')}
                            className={`flex-1 min-w-[70px] py-3 text-xs md:text-sm font-bold border-b-2 transition-colors ${infoTab === 'files' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                          >
                              Files
                          </button>
                          <button 
                            onClick={() => setInfoTab('links')}
                            className={`flex-1 min-w-[70px] py-3 text-xs md:text-sm font-bold border-b-2 transition-colors ${infoTab === 'links' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                          >
                              Links
                          </button>
                      </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                      {!isMembersExpanded && infoTab === 'links' && (
                          <div className="space-y-3 pr-2">
                              {Object.keys(sharedLinks).length > 0 ? Object.keys(sharedLinks).map(date => (
                                  <div key={date}>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1"><FaCalendar size={8} /> {date}</p>
                                      {sharedLinks[date].map((link, i) => (
                                          <a key={i} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:underline truncate mb-1">
                                              <FaLink size={10} className="flex-shrink-0" />
                                              <span className="truncate">{link}</span>
                                          </a>
                                      ))}
                                  </div>
                              )) : <p className="text-xs text-gray-400 italic text-center mt-4">No links shared yet.</p>}
                          </div>
                      )}

                      {!isMembersExpanded && infoTab === 'media' && (
                          <div className="space-y-3 pr-2">
                              {Object.keys(sharedImages).length > 0 ? Object.keys(sharedImages).map(date => (
                                  <div key={date}>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><FaCalendar size={8} /> {date}</p>
                                      <div className="grid grid-cols-3 gap-2">
                                          {sharedImages[date].map((img, i) => (
                                              <img 
                                                key={i} 
                                                src={img} 
                                                alt="Shared" 
                                                className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 border border-gray-200 dark:border-gray-600" 
                                                onClick={() => setPreviewImage(img)}
                                              />
                                          ))}
                                      </div>
                                  </div>
                              )) : <p className="text-xs text-gray-400 italic text-center mt-4">No images shared yet.</p>}
                          </div>
                      )}

                      {!isMembersExpanded && infoTab === 'files' && (
                          <div className="space-y-3 pr-2">
                              {Object.keys(sharedFiles).length > 0 ? Object.keys(sharedFiles).map(date => (
                                  <div key={date}>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><FaCalendar size={8} /> {date}</p>
                                      {sharedFiles[date].map((file, i) => (
                                          <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
                                              <div className="bg-white dark:bg-gray-600 p-2 rounded text-primary-500">
                                                  <FaFile />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                  <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
                                              </div>
                                              <a href={file.url} download={file.name} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                  <FaDownload size={12} />
                                              </a>
                                          </div>
                                      ))}
                                  </div>
                              )) : <p className="text-xs text-gray-400 italic text-center mt-4">No files shared yet.</p>}
                          </div>
                      )}

                      {/* Members List - Full Expansion */}
                      {activeChat.isGroup && isMembersExpanded && (
                          <div className="space-y-2 pr-2 h-full">
                                <div className="flex justify-end mb-2 sticky top-0 bg-white dark:bg-gray-800 z-10 py-2">
                                    {(isAdmin || isCreator || isModerator) && <button onClick={() => setIsAddMemberOpen(true)} className="text-primary-600 text-xs font-bold hover:underline flex items-center gap-1"><FaPlus size={10} /> Add Member</button>}
                                </div>
                                {activeChat.participants.map(pid => {
                                    const member = AVAILABLE_USERS.find(u => u.id === pid) || (pid === user.id ? user : { id: pid, name: 'Unknown', username: 'unknown', avatar: 'https://via.placeholder.com/30' });
                                    const isMemberAdmin = activeChat.admins?.includes(pid);
                                    const isMemberMod = activeChat.moderators?.includes(pid);
                                    
                                    const canKick = isAdmin || (isModerator && !isMemberAdmin && !isMemberMod);
                                    const canPromoteMod = isAdmin;
                                    const canDemoteMod = isAdmin;
                                    const canPromoteAdmin = isAdmin; 
                                    
                                    return (
                                        <div key={pid} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group">
                                            <img src={member.avatar} className="w-8 h-8 rounded-full" alt="" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate dark:text-white">{member.name}</p>
                                                <p className="text-[10px] text-gray-400">@{member.username || 'unknown'}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                {isMemberAdmin && <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200">Admin</span>}
                                                {isMemberMod && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">Mod</span>}
                                            </div>
                                            {(isAdmin || isModerator) && pid !== user.id && (
                                                <div className="relative group/role">
                                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><FaEllipsisV size={10} /></button>
                                                    <div className="absolute right-0 bottom-full bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 p-1 z-50 w-32 hidden group-hover/role:block">
                                                        {isAdmin && !isMemberAdmin && <button onClick={() => handlePromoteAdmin(pid)} className="block w-full text-left text-[10px] px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600 border-b border-gray-50 dark:border-gray-700">Promote Admin</button>}
                                                        {isAdmin && isMemberAdmin && <button onClick={() => handleDemoteAdmin(pid)} className="block w-full text-left text-[10px] px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-orange-600 border-b border-gray-50 dark:border-gray-700">Demote Admin</button>}
                                                        
                                                        {canPromoteMod && !isMemberMod && !isMemberAdmin && <button onClick={() => handlePromoteModerator(pid)} className="block w-full text-left text-[10px] px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 border-b border-gray-50 dark:border-gray-700">Promote Mod</button>}
                                                        {canDemoteMod && isMemberMod && <button onClick={() => handleDemoteModerator(pid)} className="block w-full text-left text-[10px] px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-orange-600 border-b border-gray-50 dark:border-gray-700">Demote Mod</button>}
                                                        
                                                        {canKick && <button onClick={() => handleRemoveMember(pid)} className="block w-full text-left text-[10px] px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600">Remove</button>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                          </div>
                      )}
                  </div>

                  <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                       {/* Members Toggle Button */}
                       {activeChat.isGroup && (
                           <div className="mb-4">
                                <div 
                                    className="flex justify-between items-center mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                                    onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                                >
                                    <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2"><FaUsers /> View Members ({activeChat.participants.length})</h4>
                                    {isMembersExpanded ? <FaChevronDown className="text-gray-400 text-xs" /> : <FaChevronUp className="text-gray-400 text-xs" />}
                                </div>
                           </div>
                       )}

                       <div className="flex flex-col gap-2 w-full">
                           {/* Buttons with text as requested */}
                           {activeChat.isGroup ? (
                               <div className="flex gap-2">
                                   {isAdmin && (
                                       <button 
                                        onClick={() => setShowDeleteConfirm(true)} 
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:text-white py-2 rounded-lg text-xs font-bold transition-colors"
                                       >
                                           <FaTrash /> Delete
                                       </button>
                                   )}
                                   <button 
                                    onClick={() => setShowLeaveGroupConfirm(true)} 
                                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:text-white py-2 rounded-lg text-xs font-bold transition-colors"
                                   >
                                       <FaSignOutAlt /> Leave
                                   </button>
                               </div>
                           ) : (
                               <>
                                   <button 
                                       onClick={handleBlockUser} 
                                       className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors ${isBlocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}
                                   >
                                       {isBlocked ? <><FaCheck /> Unblock User</> : <><FaBan /> Block User</>}
                                   </button>
                                   <button 
                                       onClick={() => setShowDeleteConfirm(true)} 
                                       className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg text-xs font-bold transition-colors dark:bg-red-900/20 dark:text-red-400"
                                   >
                                       <FaTrash /> Delete Chat
                                   </button>
                               </>
                           )}
                       </div>
                  </div>
              </div>
          </div>
      ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat to start messaging</div>
      )}

      {/* User Profile Popup */}
      {selectedUserProfile && (
          <UserProfilePopup 
              user={selectedUserProfile} 
              onClose={() => setSelectedUserProfile(null)} 
              currentUserId={user.id} 
          />
      )}

      {/* Image Preview Modal */}
      {previewImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-95 p-4 animate-fade-in" onClick={() => setPreviewImage(null)}>
              <button 
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-gray-800 bg-opacity-50"
              >
                  <FaTimes size={24} />
              </button>
              <img 
                  src={previewImage} 
                  alt="Full Preview" 
                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()} 
              />
          </div>
      )}

      {/* Group Avatar Update Modal */}
      {isAvatarModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96 shadow-2xl">
                  <h3 className="font-bold mb-4 dark:text-white">Update Group Avatar</h3>
                  
                  {avatarUploadFile ? (
                      // Cropper UI
                      <div className="flex flex-col items-center space-y-4">
                          <div 
                            className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-full relative overflow-hidden bg-gray-100 cursor-move"
                            onMouseDown={handleCropMouseDown}
                            onMouseMove={handleCropMouseMove}
                            onMouseUp={handleCropMouseUp}
                            onMouseLeave={handleCropMouseUp}
                            ref={cropperRef}
                          >
                              <img 
                                src={avatarUploadFile} 
                                alt="Crop" 
                                style={{
                                    transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                                    transformOrigin: 'center',
                                    maxWidth: 'none',
                                    width: '100%',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-50%', // Centers based on 100% width starting point logic
                                    marginLeft: '-50%'
                                }}
                                className="pointer-events-none select-none"
                                draggable={false}
                              />
                              <div className="absolute inset-0 rounded-full border-2 border-primary-500 pointer-events-none"></div>
                          </div>
                          
                          <div className="w-full flex items-center gap-2">
                              <span className="text-xs text-gray-500">Zoom</span>
                              <input 
                                type="range" 
                                min="1" 
                                max="3" 
                                step="0.1" 
                                value={cropZoom}
                                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                          </div>

                          <div className="flex justify-end gap-2 w-full pt-2">
                              <button onClick={() => setAvatarUploadFile(null)} className="text-gray-500 font-bold text-sm">Cancel</button>
                              <button onClick={handleSaveCroppedAvatar} className="bg-primary-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                                  <FaSave /> Crop & Save
                              </button>
                          </div>
                      </div>
                  ) : (
                      // Selection UI (Only File Upload now as requested)
                      <>
                        <div className="mb-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => groupUpdateAvatarInputRef.current?.click()}>
                            <FaUpload className="text-4xl text-gray-400 mb-2" />
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Click to Upload Image</p>
                            <p className="text-xs text-gray-400">JPG, PNG supported</p>
                            <input 
                                type="file" 
                                ref={groupUpdateAvatarInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleUpdateGroupAvatarFile}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setIsAvatarModalOpen(false); setUpdateGroupAvatarUrl(''); }} className="text-gray-500 font-bold text-sm">Cancel</button>
                        </div>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* Image Editing Modal (Highlight) */}
      {imageToEdit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col relative h-[80vh]">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700 shrink-0">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><FaPen /> Highlight Image</h3>
                      <button onClick={() => setImageToEdit(null)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"><FaTimes /></button>
                  </div>
                  {/* Added overflow-auto here to allow scrolling for large images */}
                  <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto flex justify-center p-4 relative">
                      <canvas 
                          ref={canvasRef} 
                          className="border shadow-lg cursor-crosshair"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                      ></canvas>
                  </div>
                  <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 shrink-0">
                      <span className="text-xs text-gray-500 flex items-center gap-2 hidden sm:flex"><FaInfoCircle /> Draw with mouse to highlight</span>
                      <div className="flex gap-3">
                          <button onClick={() => handleEditedImageAction('send_new')} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-700 transition-colors shadow-sm">
                              Send as New
                          </button>
                          {imageToEdit.originalMsgId && (
                              <button onClick={() => handleEditedImageAction('replace')} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm">
                                  Replace Original
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Modals (Create Group, Add Member, Delete Confirm, Leave Confirm) - No changes needed here */}
      {isGroupModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-80 shadow-2xl">
                  <h3 className="font-bold mb-4 dark:text-white">Create New Group</h3>
                  <div className="mb-4">
                      <div className="flex items-center gap-3">
                          <img src={newGroupAvatar || 'https://picsum.photos/seed/group/50/50'} alt="Preview" className="w-12 h-12 rounded-full object-cover border" />
                          <div className="flex-1 flex gap-2">
                              <input type="text" placeholder="Avatar URL" className="w-full border p-2 rounded text-xs bg-white text-gray-900 border-gray-300 focus:outline-none" value={newGroupAvatar} onChange={e => setNewGroupAvatar(e.target.value)} />
                              <input type="file" ref={groupAvatarInputRef} className="hidden" accept="image/*" onChange={handleGroupAvatarUpload} />
                              <button onClick={() => groupAvatarInputRef.current?.click()} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200"><FaUpload /></button>
                          </div>
                      </div>
                  </div>
                  <input type="text" placeholder="Group Name" className="w-full border p-2 rounded mb-4 bg-white text-gray-900 border-gray-300 focus:outline-none" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setIsGroupModalOpen(false)} className="text-gray-500 font-bold text-sm">Cancel</button>
                      <button onClick={handleCreateGroup} className="bg-primary-600 text-white px-4 py-2 rounded text-sm font-bold">Create</button>
                  </div>
              </div>
          </div>
      )}

      {isAddMemberOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-80 shadow-2xl">
                  <h3 className="font-bold mb-4 dark:text-white">Add Member</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                      {AVAILABLE_USERS.filter(u => !activeChat?.participants.includes(u.id)).map(u => (
                          <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer" onClick={() => handleAddMember(u.id)}>
                              <div className="flex items-center gap-2">
                                  <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                  <span className="text-sm dark:text-white">{u.name}</span>
                              </div>
                              <FaPlus className="text-primary-600" />
                          </div>
                      ))}
                      {AVAILABLE_USERS.filter(u => !activeChat?.participants.includes(u.id)).length === 0 && <p className="text-sm text-gray-500">No more users to add.</p>}
                  </div>
                  <div className="flex justify-end mt-4">
                      <button onClick={() => setIsAddMemberOpen(false)} className="text-gray-500 font-bold text-sm">Close</button>
                  </div>
              </div>
          </div>
      )}

      {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-80 shadow-2xl">
                  <h3 className="font-bold mb-2 dark:text-white">Delete Chat?</h3>
                  <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">This will remove the conversation for you. This action cannot be undone.</p>
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                      <button onClick={handleDeleteChat} className="px-3 py-1 bg-red-600 text-white font-bold text-sm rounded hover:bg-red-700">Delete</button>
                  </div>
              </div>
          </div>
      )}

      {showLeaveGroupConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-80 shadow-2xl">
                  <h3 className="font-bold mb-2 dark:text-white">Leave Group?</h3>
                  <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Are you sure you want to leave this group?</p>
                  <label className="flex items-center gap-2 mb-4 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={blockFutureInvites} onChange={e => setBlockFutureInvites(e.target.checked)} className="rounded text-primary-600 focus:ring-primary-500" />
                      Prevent re-invites to this group
                  </label>
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setShowLeaveGroupConfirm(false)} className="px-3 py-1 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                      <button onClick={handleLeaveGroup} className="px-3 py-1 bg-red-600 text-white font-bold text-sm rounded hover:bg-red-700">Leave</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Chat;
