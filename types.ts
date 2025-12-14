
export enum UserRole {
  STUDENT = 'Student',
  INSTRUCTOR = 'Instructor',
  ADMIN = 'Admin'
}

export type SocialPlatform = 'facebook' | 'linkedin' | 'github' | 'youtube' | 'website' | 'twitter' | 'instagram' | 'tiktok';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  isVisible: boolean;
}

export interface ActivityLog {
  date: string; // ISO Date string YYYY-MM-DD
  xpEarned: number;
  type: 'login' | 'lesson' | 'quiz' | 'badge' | 'referral';
  detail?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: UserRole;
  level: number;
  xp: number;
  streak: number;
  lastLoginDate: string; // ISO Date string YYYY-MM-DD
  badges: string[]; // List of Badge Names/IDs
  equippedBadge?: string; // The badge currently shown as title
  certificates: string[]; 
  bio?: string;
  jobTitle?: string;
  socials?: SocialLink[];
  
  // Referral System
  referralCode?: string;
  invitedFriends?: string[]; // IDs of people this user invited
  referredBy?: string; // ID of the person who invited this user
  
  activityLogs?: ActivityLog[];
  blockedUsers?: string[]; // List of user IDs blocked by this user
  accountStatus?: 'active' | 'banned_temp' | 'banned_perm'; // Admin feature
  banExpires?: string; // ISO date for temp ban
}

export interface BadgeDef {
  id: string;
  name: string;
  icon: string; // Emoji or URL
  description: string;
  xpBonus: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole?: string;
  content: string;
  timestamp: string;
  likes: number; // Legacy total count
  reactions?: { [emoji: string]: string[] }; // Emoji mapped to array of User IDs
  replies?: Comment[];
  parentId?: string;
  isPinned?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; 
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  completed: boolean;
  type: 'video' | 'quiz' | 'document';
  // Lesson specific resources
  resources?: { id: string; title: string; url: string; type: 'pdf'|'link'|'zip'|'file' }[];
  overview?: string; // Short description for the lesson
  quizData?: QuizQuestion[]; // For type='quiz'
  content?: string; // For type='document' (HTML/Markdown content)
}

export interface Note {
    id: string;
    timestamp: number; // Seconds
    displayTime: string; // "05:30"
    content: string;
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Coupon {
  code: string;
  type: 'percent' | 'free' | 'fixed'; // Added 'fixed' for price amount off
  value: number; // 0-100 if percent, amount if fixed
  expiresAt?: string; // ISO Date
  allowedUserIds?: string[]; // If empty, allowed for everyone
  maxUses?: number; // Maximum number of times coupon can be used
  usedCount?: number; // Current usage count
}

export interface CourseResource {
    id: string;
    title: string;
    url: string;
    type: 'pdf' | 'link' | 'zip' | 'file';
}

export interface CourseInstructor {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
    rating?: number;
    coursesCount?: number;
    studentsCount?: number;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number; // 1-5
    comment: string;
    date: string; // ISO String
}

export interface Course {
  id: string;
  title: string;
  thumbnail: string;
  previewVideoUrl?: string; // For the sidebar preview
  // Changed from single instructor object to array
  instructors: CourseInstructor[];
  rating: number;
  reviewsCount: number;
  totalStudents: number;
  totalDuration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  learningPoints?: string[]; // "What you'll learn"
  resources?: CourseResource[]; // Global Course Resources
  progress: number;
  sections: Section[];
  price: number;
  originalPrice?: number; // New: Original Price for Strike-through
  discountDeadline?: string; // New: ISO Date for discount expiry
  isEnrolled: boolean;
  finalQuiz?: QuizQuestion[];
  coupons?: Coupon[];
  bio?: string; // Course Description
  reviews?: Review[]; // New: List of reviews
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'badge' | 'mention';
  title: string;
  message: string;
  time: string;
  read: boolean;
  metadata?: { targetUrl?: string }; // For navigation
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  images?: string[]; // Added support for images
  author: { id: string; name: string; avatar: string };
  category: string;
  repliesCount: number;
  views: number;
  time: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  isLiked?: boolean;
  isLocked?: boolean; // Admin feature
}

export interface Message {
  id: string;
  senderId: string; // 'system' if type is system
  text: string;
  time: string;
  type: 'text' | 'image' | 'file' | 'badge' | 'certificate' | 'system'; // Added system type
  fileUrl?: string;
  badgeData?: BadgeDef; // If type is badge
  certificateId?: string; // If type is certificate
  reactions?: { [emoji: string]: number };
  replyToId?: string;
  replyToText?: string;
  isPinned?: boolean;
  isUnsent?: boolean;
  deletedFor?: string[];
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name: string;
  avatar: string;
  participants: string[];
  admins?: string[]; // Leaders
  moderators?: string[]; // Vice Leaders
  lastMessage: string;
  unreadCount: number;
  time: string;
  messages: Message[];
  status?: 'online' | 'offline' | 'busy';
}

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  studentName: string;
  issueDate: string;
  instructorName: string;
  score: number;
}
