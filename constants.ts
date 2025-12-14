
import { User, UserRole, Course, Notification, ForumPost, BadgeDef } from './types';

// Define Badges System
export const BADGES: BadgeDef[] = [
  { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Study before 8am', xpBonus: 50, rarity: 'common' },
  { id: 'night_owl', name: 'Night Owl', icon: '🦉', description: 'Post or Study after 10pm', xpBonus: 50, rarity: 'common' },
  { id: 'code_warrior', name: 'Code Warrior', icon: '💻', description: 'Complete 10 coding exercises', xpBonus: 100, rarity: 'rare' },
  { id: 'top_contributor', name: 'Top Contributor', icon: '💬', description: '5 helpful comments', xpBonus: 150, rarity: 'rare' },
  { id: 'topic_starter', name: 'Discussion Leader', icon: '📢', description: 'Create 3 Forum Topics', xpBonus: 200, rarity: 'rare' },
  { id: 'helpful_hand', name: 'Helpful Hand', icon: '🤝', description: 'Receive 10 Likes on your posts', xpBonus: 300, rarity: 'epic' },
  { id: 'marathon', name: 'Marathon', icon: '🏃', description: 'Study for 5 hours straight', xpBonus: 200, rarity: 'epic' },
  { id: 'bug_hunter', name: 'Bug Hunter', icon: '🐛', description: 'Report a bug', xpBonus: 300, rarity: 'epic' },
  { id: 'socialite', name: 'Socialite', icon: '💌', description: 'Refer a friend', xpBonus: 100, rarity: 'common' },
  { id: 'mastermind', name: 'Mastermind', icon: '🧠', description: 'Score 100% on a quiz', xpBonus: 500, rarity: 'legendary' },
  { id: 'legend', name: 'Legend', icon: '👑', description: 'Reach Level 50', xpBonus: 1000, rarity: 'legendary' },
  { id: 'streak_7', name: 'Week Warrior', icon: '🔥', description: '7 day streak', xpBonus: 100, rarity: 'common' },
  { id: 'streak_30', name: 'Monthly Master', icon: '📅', description: '30 day streak', xpBonus: 500, rarity: 'epic' },
];

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  username: '@alex_dev',
  avatar: 'https://picsum.photos/seed/alex/200/200',
  role: UserRole.STUDENT,
  level: 12,
  xp: 4500,
  streak: 15,
  lastLoginDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
  badges: ['early_bird', 'code_warrior', 'top_contributor'],
  equippedBadge: 'code_warrior',
  certificates: [],
  bio: 'Passionate about building accessible web applications and teaching others.',
  jobTitle: 'Fullstack Developer',
  referralCode: 'ALEX2024',
  invitedFriends: ['u_mike', 'u_emily'],
  activityLogs: [], // Initial empty log
  blockedUsers: [],
  socials: [
    { platform: 'github', url: 'https://github.com/alex', isVisible: true },
    { platform: 'linkedin', url: 'https://linkedin.com/in/alex', isVisible: true },
    { platform: 'website', url: 'https://alex.dev', isVisible: true },
  ]
};

// Helper for recent dates
const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'success', title: 'Achievement Unlocked', message: 'You reached a 15-day streak!', time: minutesAgo(2), read: false },
  { id: 'n2', type: 'info', title: 'New Course Available', message: 'Advanced React Patterns is now live.', time: hoursAgo(1), read: false },
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Fullstack React & Node.js Masterclass',
    thumbnail: 'https://picsum.photos/seed/react/800/450',
    instructors: [{ id: 'i1', name: 'Sarah Drasner', avatar: 'https://picsum.photos/seed/sarah/100/100', rating: 4.9, coursesCount: 10, studentsCount: 15000 }],
    rating: 4.8,
    reviewsCount: 3,
    totalStudents: 8500,
    totalDuration: '42h 30m',
    level: 'Advanced',
    tags: ['React', 'NodeJS', 'TypeScript'],
    progress: 45,
    price: 99,
    isEnrolled: true,
    reviews: [
        { id: 'r1', userId: 'u3', userName: 'Mike Smith', userAvatar: 'https://picsum.photos/seed/mike/50/50', rating: 5, comment: 'This course is absolutely amazing! The depth of React covered is unmatched.', date: hoursAgo(24) },
        { id: 'r2', userId: 'u4', userName: 'Emily Rose', userAvatar: 'https://picsum.photos/seed/emily/50/50', rating: 4, comment: 'Great content but the Node.js section felt a bit rushed.', date: hoursAgo(48) },
        { id: 'r3', userId: 'u_david', userName: 'David Lee', userAvatar: 'https://picsum.photos/seed/david/50/50', rating: 5, comment: 'Best investment for my career.', date: hoursAgo(120) }
    ],
    sections: [
      {
        id: 's1',
        title: 'Introduction & Setup',
        lessons: [
          { id: 'l1', title: 'Course Overview', duration: '05:20', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', completed: true, type: 'video' },
          { id: 'l2', title: 'Environment Setup', duration: '12:15', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', completed: true, type: 'video' },
        ]
      },
      {
        id: 's2',
        title: 'Advanced Hooks',
        lessons: [
          { id: 'l3', title: 'useMemo & useCallback', duration: '15:40', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', completed: false, type: 'video' },
          { id: 'l4', title: 'Custom Hooks', duration: '20:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', completed: false, type: 'video' },
        ]
      }
    ]
  },
  {
    id: 'c2',
    title: 'UI/UX Design Principles for Developers',
    thumbnail: 'https://picsum.photos/seed/design/800/450',
    instructors: [{ id: 'i2', name: 'Gary Simon', avatar: 'https://picsum.photos/seed/gary/100/100', rating: 4.8, coursesCount: 5, studentsCount: 8000 }],
    rating: 4.9,
    reviewsCount: 890,
    totalStudents: 12000,
    totalDuration: '18h 15m',
    level: 'Beginner',
    tags: ['Design', 'Figma', 'CSS'],
    progress: 10,
    price: 49,
    isEnrolled: true,
    reviews: [],
    sections: [
      {
        id: 's1',
        title: 'Color Theory',
        lessons: [
          { id: 'l1', title: 'Understanding HSL', duration: '08:00', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', completed: true, type: 'video' },
        ]
      }
    ]
  },
  {
    id: 'c3',
    title: 'Python for Data Science Bootcamp',
    thumbnail: 'https://picsum.photos/seed/python/800/450',
    instructors: [{ id: 'i3', name: 'Jose Portilla', avatar: 'https://picsum.photos/seed/jose/100/100', rating: 4.7, coursesCount: 20, studentsCount: 50000 }],
    rating: 4.7,
    reviewsCount: 3500,
    totalStudents: 25000,
    totalDuration: '50h 00m',
    level: 'Beginner',
    tags: ['Python', 'Data Science', 'AI'],
    progress: 0,
    price: 129,
    isEnrolled: false,
    reviews: [],
    sections: []
  },
    {
    id: 'c4',
    title: 'AWS Certified Solutions Architect',
    thumbnail: 'https://picsum.photos/seed/aws/800/450',
    instructors: [{ id: 'i4', name: 'Stephane Maarek', avatar: 'https://picsum.photos/seed/steph/100/100', rating: 4.9, coursesCount: 8, studentsCount: 30000 }],
    rating: 4.9,
    reviewsCount: 5000,
    totalStudents: 40000,
    totalDuration: '28h 00m',
    level: 'Intermediate',
    tags: ['Cloud', 'AWS', 'DevOps'],
    progress: 0,
    price: 89,
    isEnrolled: false,
    reviews: [],
    sections: []
  },
  {
    id: 'c5',
    title: 'Flutter & Dart - The Complete Guide',
    thumbnail: 'https://picsum.photos/seed/flutter/800/450',
    instructors: [{ id: 'i5', name: 'Max Schwarzmüller', avatar: 'https://picsum.photos/seed/max/100/100', rating: 4.8, coursesCount: 15, studentsCount: 40000 }],
    rating: 4.6,
    reviewsCount: 2100,
    totalStudents: 15000,
    totalDuration: '30h 00m',
    level: 'Beginner',
    tags: ['Mobile', 'Flutter', 'Dart'],
    progress: 0,
    price: 94,
    isEnrolled: false,
    reviews: [],
    sections: []
  },
  {
    id: 'c6',
    title: 'Docker & Kubernetes: The Practical Guide',
    thumbnail: 'https://picsum.photos/seed/docker/800/450',
    instructors: [{ id: 'i6', name: 'Academind', avatar: 'https://picsum.photos/seed/academind/100/100', rating: 4.8, coursesCount: 25, studentsCount: 60000 }],
    rating: 4.8,
    reviewsCount: 1800,
    totalStudents: 9000,
    totalDuration: '22h 00m',
    level: 'Advanced',
    tags: ['DevOps', 'Docker', 'Kubernetes'],
    progress: 0,
    price: 109,
    isEnrolled: false,
    reviews: [],
    sections: []
  }
];

export const MOCK_FORUM_POSTS: ForumPost[] = [
  {
    id: 'p1',
    title: 'How to handle global state in 2024? Redux Toolkit vs Zustand?',
    content: "I'm starting a new large-scale React application and debating between Redux Toolkit and Zustand. What are the pros and cons in 2024? I feel like Redux is too boilerplate-heavy for my needs, but Zustand might lack some devtools features.",
    author: { id: 'u_dm', name: 'DevMike', avatar: 'https://picsum.photos/seed/mike/50/50' },
    category: 'React Ecosystem',
    repliesCount: 42,
    views: 1205,
    time: hoursAgo(2),
    tags: ['State Management', 'React'],
    likes: 15,
    comments: [],
    images: ['https://picsum.photos/seed/code1/600/300', 'https://picsum.photos/seed/chart1/600/300']
  },
  {
    id: 'p2',
    title: 'Feedback on my first portfolio design',
    content: "I just finished designing my portfolio using Figma and would love some constructive feedback on the layout and color scheme. Does the contrast look okay?",
    author: { id: 'u_sd', name: 'SarahDesign', avatar: 'https://picsum.photos/seed/sarahd/50/50' },
    category: 'Design Critique',
    repliesCount: 15,
    views: 340,
    time: hoursAgo(5),
    tags: ['Portfolio', 'UI/UX'],
    likes: 8,
    comments: [],
    images: ['https://picsum.photos/seed/portfolio1/800/600']
  },
  {
    id: 'p3',
    title: 'Best way to deploy Python Flask apps?',
    content: "I'm confused between using Heroku, AWS Elastic Beanstalk, or just a DigitalOcean droplet. What is the most cost-effective way for a small side project?",
    author: { id: 'u_py', name: 'PyFanatic', avatar: 'https://picsum.photos/seed/jose/50/50' },
    category: 'Backend',
    repliesCount: 8,
    views: 150,
    time: hoursAgo(12),
    tags: ['Python', 'Deployment', 'DevOps'],
    likes: 5,
    comments: []
  }
];
