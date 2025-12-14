
import { MOCK_COURSES, MOCK_FORUM_POSTS, CURRENT_USER, MOCK_NOTIFICATIONS, BADGES } from '../constants';
import { User, Course, ForumPost, Conversation, Certificate, UserRole, Comment, Message, BadgeDef, ActivityLog, Notification, Section, Lesson, Coupon, CourseInstructor, Review } from '../types';

const STORAGE_KEYS = {
  USER: 'edupro_user',
  COURSES: 'edupro_courses',
  FORUM: 'edupro_forum',
  CHATS: 'edupro_chats',
  CERTIFICATES: 'edupro_certificates',
  NOTIFICATIONS: 'edupro_notifications',
  THEME: 'edupro_theme',
  ALL_USERS: 'edupro_all_users'
};

const MOCK_USER_DIRECTORY: User[] = [
    { ...CURRENT_USER, id: 'u1', accountStatus: 'active', referralCode: 'ALEX2024' },
    { id: 'u2', name: 'Sarah Drasner', username: 'sarah_d', avatar: 'https://picsum.photos/seed/sarah/50/50', role: UserRole.INSTRUCTOR, level: 45, xp: 205000, streak: 120, lastLoginDate: '2023-10-01', badges: ['legend', 'mastermind'], certificates: [], socials: [], accountStatus: 'active', referralCode: 'SARAH1' },
    { id: 'u3', name: 'Mike Smith', username: 'mike_code', avatar: 'https://picsum.photos/seed/mike/50/50', role: UserRole.STUDENT, level: 8, xp: 6500, streak: 3, lastLoginDate: '2023-10-01', badges: ['code_warrior'], certificates: [], socials: [], accountStatus: 'active', referralCode: 'MIKE99' },
    { id: 'u4', name: 'Emily Rose', username: 'emily_r', avatar: 'https://picsum.photos/seed/emily/50/50', role: UserRole.STUDENT, level: 15, xp: 22500, streak: 20, lastLoginDate: '2023-10-01', badges: ['socialite'], certificates: [], socials: [], accountStatus: 'active', referralCode: 'EMILYR' },
    { id: 'u_dm', name: 'DevMike', username: 'dev_mike', avatar: 'https://picsum.photos/seed/mike/50/50', role: UserRole.STUDENT, level: 20, xp: 40000, streak: 5, lastLoginDate: '2023-10-01', badges: [], certificates: [], accountStatus: 'active' },
    { id: 'u_sd', name: 'SarahDesign', username: 'sarah_design', avatar: 'https://picsum.photos/seed/sarahd/50/50', role: UserRole.STUDENT, level: 5, xp: 2600, streak: 1, lastLoginDate: '2023-10-01', badges: [], certificates: [], accountStatus: 'active' },
    { id: 'u_py', name: 'PyFanatic', username: 'py_fan', avatar: 'https://picsum.photos/seed/jose/50/50', role: UserRole.STUDENT, level: 30, xp: 90000, streak: 45, lastLoginDate: '2023-10-01', badges: [], certificates: [], accountStatus: 'active' },
    { id: 'u_admin', name: 'System Admin', username: 'admin_sys', avatar: 'https://picsum.photos/seed/admin/50/50', role: UserRole.ADMIN, level: 100, xp: 500000, streak: 999, lastLoginDate: '2023-10-01', badges: ['legend'], certificates: [], socials: [], accountStatus: 'active' }
];

export const formatDisplayTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    if (isToday) return `${hours}:${minutes}`;
    else return `${hours}:${minutes} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

export const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) { document.documentElement.classList.remove('dark'); localStorage.setItem(STORAGE_KEYS.THEME, 'light'); } 
    else { document.documentElement.classList.add('dark'); localStorage.setItem(STORAGE_KEYS.THEME, 'dark'); }
    return !isDark;
};

export const initTheme = () => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    else { document.documentElement.classList.remove('dark'); if (!savedTheme) localStorage.setItem(STORAGE_KEYS.THEME, 'light'); }
};

const dispatchBadgeEvent = (badge: BadgeDef) => { window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: badge })); };
const dispatchUserUpdate = (user: User) => { window.dispatchEvent(new CustomEvent('user-updated', { detail: user })); };
const dispatchLevelUpEvent = (level: number) => { window.dispatchEvent(new CustomEvent('level-up', { detail: level })); };

export const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USER)) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ ...CURRENT_USER, accountStatus: 'active', referralCode: 'ALEX2024' }));
  if (!localStorage.getItem(STORAGE_KEYS.ALL_USERS)) localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(MOCK_USER_DIRECTORY));
  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(MOCK_COURSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FORUM)) localStorage.setItem(STORAGE_KEYS.FORUM, JSON.stringify(MOCK_FORUM_POSTS.map(p => ({ ...p, comments: [], content: p.content, isLocked: false }))));
  if (!localStorage.getItem(STORAGE_KEYS.CHATS)) {
    const mockChats = [
        { id: '1', isGroup: false, name: 'Sarah Drasner', avatar: 'https://picsum.photos/seed/sarah/50/50', participants: ['u1', 'u2'], lastMessage: 'Sure, let me check.', unreadCount: 2, time: '10:30 AM', status: 'online', messages: [] },
        { id: '2', isGroup: true, name: 'React Study Group', avatar: 'https://picsum.photos/seed/reactgrp/50/50', participants: ['u1', 'u2', 'u3'], admins: ['u1'], lastMessage: 'Anyone solved the challenge?', unreadCount: 5, time: '09:15 AM', messages: [] }
    ];
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(mockChats));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(MOCK_NOTIFICATIONS));
};

// ... Rest of the file logic ...
// (Helper functions from previous version, kept concise here for update context)
export const getAllUsers = (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || '[]');
export const saveAllUsers = (users: User[]) => localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
export const notifyUser = (userId: string, title: string, message: string, type: Notification['type'] = 'info') => {
    const currentUser = getUser();
    // In a real app this pushes to specific user. For mock, we just update if it's current user or log it.
    if(userId === currentUser.id) addNotification({ title, message, type });
};
export const getCourses = (): Course[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');
export const addCourse = (course: Course) => {
    const courses = getCourses();
    courses.push(course);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    addNotification({ title: 'Course Created', message: `Course "${course.title}" created successfully.`, type: 'success' });
    return courses;
};
export const updateCourse = (updatedCourse: Course) => {
    const courses = getCourses();
    const index = courses.findIndex(c => c.id === updatedCourse.id);
    if(index !== -1) {
        courses[index] = updatedCourse;
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
        addNotification({ title: 'Course Updated', message: `Changes to "${updatedCourse.title}" have been saved.`, type: 'info' });
    }
    return courses;
};
export const deleteCourse = (courseId: string) => {
    let courses = getCourses();
    const course = courses.find(c => c.id === courseId);
    if (course) {
        const updatedCourses = courses.filter(c => c.id !== courseId);
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updatedCourses));
        addNotification({ title: 'Course Deleted', message: `Course "${course.title}" has been removed.`, type: 'warning' });
    }
    return courses;
};
export const validateCoupon = (code: string, courseId: string, userId: string): { isValid: boolean, type?: 'percent' | 'free' | 'fixed', value?: number, message: string } => {
    const courses = getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.coupons) return { isValid: false, message: 'Invalid coupon code.' };
    const couponIndex = course.coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    if (couponIndex === -1) return { isValid: false, message: 'Invalid coupon code.' };
    const coupon = course.coupons[couponIndex];
    if (coupon.expiresAt) {
        const today = new Date();
        const expiration = new Date(coupon.expiresAt);
        today.setHours(0,0,0,0);
        expiration.setHours(0,0,0,0);
        if (expiration < today) return { isValid: false, message: 'This coupon has expired.' };
    }
    if (coupon.maxUses !== undefined && coupon.maxUses > 0) {
        const currentUses = coupon.usedCount || 0;
        if (currentUses >= coupon.maxUses) return { isValid: false, message: 'This coupon has reached its maximum usage limit.' };
    }
    if (coupon.allowedUserIds && coupon.allowedUserIds.length > 0) {
        if (!coupon.allowedUserIds.includes(userId)) return { isValid: false, message: 'This coupon is not valid for your account.' };
    }
    return { isValid: true, type: coupon.type, value: coupon.value, message: 'Coupon applied successfully!' };
};
export const enrollCourse = (courseId: string) => {
    const courses = getCourses();
    const index = courses.findIndex(c => c.id === courseId);
    if(index !== -1) {
        courses[index].isEnrolled = true;
        if(courses[index].progress === undefined) courses[index].progress = 0;
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
        addXP(10, `Enrolled in ${courses[index].title}`);
        addNotification({ title: 'Success', message: `You have enrolled in ${courses[index].title}`, type: 'success' });
        return courses[index];
    }
    return undefined;
}
export const getForumPosts = (): ForumPost[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.FORUM) || '[]');
export const createForumPost = (post: ForumPost) => {
    const posts = getForumPosts();
    posts.unshift(post);
    localStorage.setItem(STORAGE_KEYS.FORUM, JSON.stringify(posts));
    addXP(20, 'Create Forum Topic');
    return posts;
};
export const deleteTopic = (postId: string) => {
    let posts = getForumPosts();
    const post = posts.find(p => p.id === postId);
    if(post) {
        notifyUser(post.author.id, 'Topic Deleted', `Your topic "${post.title}" was removed by an admin/moderator.`, 'warning');
        const updatedPosts = posts.filter(p => p.id !== postId);
        localStorage.setItem(STORAGE_KEYS.FORUM, JSON.stringify(updatedPosts));
        return updatedPosts;
    }
    return posts;
};
export const lockTopic = (postId: string, isLocked: boolean) => {
    const posts = getForumPosts();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx !== -1) {
        posts[idx].isLocked = isLocked;
        localStorage.setItem(STORAGE_KEYS.FORUM, JSON.stringify(posts));
        const status = isLocked ? 'Locked' : 'Unlocked';
        notifyUser(posts[idx].author.id, `Topic ${status}`, `Your topic "${posts[idx].title}" has been ${status.toLowerCase()}.`, 'info');
        return posts[idx];
    }
    return null;
};
export const deleteComment = (postId: string, commentId: string) => {
    const posts = getForumPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
        const post = posts[postIndex];
        const findAndRemove = (comments: Comment[]): Comment[] => {
            return comments.filter(c => {
                if (c.id === commentId) {
                    notifyUser(c.userId, 'Comment Removed', 'Your comment was removed by a moderator.', 'warning');
                    return false;
                }
                if (c.replies) c.replies = findAndRemove(c.replies);
                return true;
            });
        };
        post.comments = findAndRemove(post.comments);
        post.repliesCount = Math.max(0, post.repliesCount - 1);
        posts[postIndex] = post;
        localStorage.setItem(STORAGE_KEYS.FORUM, JSON.stringify(posts));
        return post;
    }
    return undefined;
};
export const reportContent = (type: 'topic' | 'comment', id: string, reason: string, details?: string) => {
    addNotification({
        title: 'New Report Received',
        message: `${type.toUpperCase()} reported: ${reason}. ${details ? `Details: ${details}` : ''}`,
        type: 'warning',
        metadata: { targetUrl: type === 'topic' ? `/community/topic/${id}` : `/community` }
    });
    return true;
};
export const getUser = (): User => {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    if (!user.accountStatus) user.accountStatus = 'active';
    const calculatedLevel = calculateLevelFromXP(user.xp);
    if (calculatedLevel !== user.level) {
        user.level = calculatedLevel;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    if (!user.blockedUsers) user.blockedUsers = [];
    return user;
};
export const getUserById = (id: string): User | undefined => getAllUsers().find(u => u.id === id);

// --- AUTH & REFERRAL LOGIC ---
const generateReferralCode = (name: string) => {
    const base = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${base}${rand}`;
}

export const registerUser = (name: string, email: string, referralCodeInput?: string) => {
    const allUsers = getAllUsers();
    
    // Create new User ID
    const newId = `u_${Date.now()}`;
    const generatedRefCode = generateReferralCode(name);
    
    const newUser: User = {
        id: newId,
        name: name,
        username: name.toLowerCase().replace(' ', '_'),
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
        role: UserRole.STUDENT,
        level: 1,
        xp: 0,
        streak: 1,
        lastLoginDate: new Date().toISOString().split('T')[0],
        badges: [],
        certificates: [],
        socials: [],
        referralCode: generatedRefCode,
        accountStatus: 'active',
        invitedFriends: [],
        activityLogs: [{
            date: new Date().toISOString().split('T')[0],
            xpEarned: 0,
            type: 'login',
            detail: 'Joined EduPro'
        }]
    };

    let rewardGiven = false;

    // Handle Referral Logic
    if (referralCodeInput) {
        const inviterIndex = allUsers.findIndex(u => u.referralCode === referralCodeInput.toUpperCase());
        if (inviterIndex !== -1) {
            const inviter = allUsers[inviterIndex];
            
            // Link users
            newUser.referredBy = inviter.id;
            if (!inviter.invitedFriends) inviter.invitedFriends = [];
            inviter.invitedFriends.push(newId);
            
            // Award Inviter XP
            inviter.xp += 200; // Reward for inviter
            // Update inviter in DB
            allUsers[inviterIndex] = inviter;
            
            // Award New User XP
            newUser.xp += 500;
            newUser.activityLogs?.unshift({
                date: new Date().toISOString().split('T')[0],
                xpEarned: 500,
                type: 'referral',
                detail: `Joined via invitation from ${inviter.name}`
            });
            rewardGiven = true;
        }
    }

    allUsers.push(newUser);
    saveAllUsers(allUsers);
    
    // Login
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    return { success: true, rewardGiven };
};

export const loginAsUser = (userId: string) => {
    const allUsers = getAllUsers();
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        if (user.accountStatus === 'banned_perm') { alert('This account has been permanently banned.'); return false; }
        if (user.accountStatus === 'banned_temp' && user.banExpires) {
            const expireDate = new Date(user.banExpires);
            if (expireDate > new Date()) { alert(`This account is banned until ${expireDate.toLocaleDateString()}`); return false; } 
            else { user.accountStatus = 'active'; user.banExpires = undefined; const idx = allUsers.findIndex(u => u.id === user.id); if(idx !== -1) allUsers[idx] = user; saveAllUsers(allUsers); }
        }
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return true;
    }
    return false;
};
export const updateUserProfile = (updates: Partial<User>) => { const user = getUser(); const updatedUser = { ...user, ...updates }; localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser)); const allUsers = getAllUsers(); const idx = allUsers.findIndex(u => u.id === user.id); if(idx !== -1) { allUsers[idx] = { ...allUsers[idx], ...updates }; saveAllUsers(allUsers); } dispatchUserUpdate(updatedUser); return updatedUser; }
export const updateAnyUser = (userId: string, updates: Partial<User>) => {
    const allUsers = getAllUsers();
    const idx = allUsers.findIndex(u => u.id === userId);
    if (idx !== -1) {
        allUsers[idx] = { ...allUsers[idx], ...updates };
        // Recalculate level if XP changed
        if (updates.xp !== undefined) {
            allUsers[idx].level = calculateLevelFromXP(updates.xp);
        }
        saveAllUsers(allUsers);
        // If updating current user
        if (getUser().id === userId) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(allUsers[idx]));
            dispatchUserUpdate(allUsers[idx]);
        }
        return allUsers[idx];
    }
    return null;
}
export const toggleBlockUser = (userId: string) => { const user = getUser(); if (!user.blockedUsers) user.blockedUsers = []; if (user.blockedUsers.includes(userId)) { user.blockedUsers = user.blockedUsers.filter(id => id !== userId); } else { user.blockedUsers.push(userId); } localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); dispatchUserUpdate(user); return user; };
export const calculateLevelFromXP = (xp: number) => Math.floor(Math.sqrt(xp / 100)) || 1;
export const calculateXPForLevel = (level: number) => level * level * 100;
export const addXP = (amount: number, reason: string = 'Activity') => { const user = getUser(); user.xp += amount; const newLevel = calculateLevelFromXP(user.xp); if (newLevel > user.level) { user.level = newLevel; dispatchLevelUpEvent(newLevel); addNotification({ type: 'success', title: 'Level Up!', message: `Congratulations! You reached Level ${newLevel}.` }); } const today = new Date().toISOString().split('T')[0]; if (!user.activityLogs) user.activityLogs = []; user.activityLogs.unshift({ date: today, xpEarned: amount, type: 'lesson', detail: reason }); localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); const allUsers = getAllUsers(); const idx = allUsers.findIndex(u => u.id === user.id); if(idx !== -1) { allUsers[idx].xp = user.xp; allUsers[idx].level = user.level; saveAllUsers(allUsers); } dispatchUserUpdate(user); return user; };
export const checkActionBadges = (actionType: 'post' | 'comment' | 'time' | 'like') => { const user = getUser(); let newBadge: BadgeDef | undefined; const hour = new Date().getHours(); if (actionType === 'time' && (hour >= 22 || hour < 4) && !user.badges.includes('night_owl')) { const badge = BADGES.find(b => b.id === 'night_owl'); if (badge) { user.badges.push('night_owl'); user.xp += badge.xpBonus; newBadge = badge; } } if (actionType === 'post' && !user.badges.includes('topic_starter')) { const myPosts = getForumPosts().filter(p => p.author.id === user.id); if (myPosts.length >= 3) { const badge = BADGES.find(b => b.id === 'topic_starter'); if (badge) { user.badges.push('topic_starter'); user.xp += badge.xpBonus; newBadge = badge; } } } if (actionType === 'like' && !user.badges.includes('helpful_hand')) { const myPosts = getForumPosts().filter(p => p.author.id === user.id); const totalLikes = myPosts.reduce((acc, p) => acc + p.likes, 0); if (totalLikes >= 10) { const badge = BADGES.find(b => b.id === 'helpful_hand'); if (badge) { user.badges.push('helpful_hand'); user.xp += badge.xpBonus; newBadge = badge; } } } if (newBadge) { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); dispatchBadgeEvent(newBadge); dispatchUserUpdate(user); return newBadge; } return null; }
export const calculateBadgeProgress = (badgeId: string): number => { const user = getUser(); switch(badgeId) { case 'streak_7': return Math.min(100, (user.streak / 7) * 100); case 'streak_30': return Math.min(100, (user.streak / 30) * 100); case 'topic_starter': { const myPosts = getForumPosts().filter(p => p.author.id === user.id); return Math.min(100, (myPosts.length / 3) * 100); } case 'helpful_hand': { const myPosts = getForumPosts().filter(p => p.author.id === user.id); const totalLikes = myPosts.reduce((acc, p) => acc + p.likes, 0); return Math.min(100, (totalLikes / 10) * 100); } case 'code_warrior': return 40; case 'socialite': return user.invitedFriends && user.invitedFriends.length > 0 ? 100 : 0; case 'top_contributor': return 20; case 'legend': return Math.min(100, (user.level / 50) * 100); default: return 0; } };
export const getNotifications = (): Notification[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
export const addNotification = (note: Omit<Notification, 'id' | 'read' | 'time'>) => { const notifications = getNotifications(); const newNote: Notification = { id: Date.now().toString(), read: false, time: new Date().toISOString(), ...note }; notifications.unshift(newNote); localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)); return newNote; }
export const markNotificationsRead = () => { const notifications = getNotifications(); const updated = notifications.map(n => ({...n, read: true})); localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated)); }
export const checkDailyLogin = (): { user: User, earnedXP: number, isNewDay: boolean, newBadge?: BadgeDef } | null => { const user = getUser(); const today = new Date().toISOString().split('T')[0]; if (user.lastLoginDate === today) return null; let streak = user.streak; const lastLogin = new Date(user.lastLoginDate); const diffTime = Math.abs(new Date(today).getTime() - lastLogin.getTime()); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); if (diffDays === 1) streak += 1; else if (diffDays > 1) streak = 1; const totalXP = 20 + streak; user.xp += totalXP; user.streak = streak; user.lastLoginDate = today; if(!user.activityLogs) user.activityLogs = []; user.activityLogs.unshift({ date: today, xpEarned: totalXP, type: 'login', detail: `Daily Login (+20) + Streak ${streak} Days (+${streak})` }); localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); dispatchUserUpdate(user); return { user, earnedXP: totalXP, isNewDay: true }; };
export const equipBadge = (badgeId: string) => { const user = getUser(); if(user.badges.includes(badgeId)) { user.equippedBadge = badgeId; localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); dispatchUserUpdate(user); } return user; }
export const getBadgeDetails = (badgeId: string): BadgeDef | undefined => BADGES.find(b => b.id === badgeId);
export const getCourseById = (id: string): Course | undefined => getCourses().find(c => c.id === id);
export const updateLessonProgress = (courseId: string, lessonId: string) => { const courses = getCourses(); const courseIndex = courses.findIndex(c => c.id === courseId); if (courseIndex === -1) return; const course = courses[courseIndex]; let totalLessons = 0; let completedLessons = 0; course.sections.forEach(s => { s.lessons.forEach(l => { totalLessons++; if (l.id === lessonId) { if (!l.completed) { l.completed = true; addXP(50, `Completed Lesson: ${l.title}`); checkActionBadges('time'); } } if (l.completed) completedLessons++; }); }); course.progress = Math.round((completedLessons / totalLessons) * 100); courses[courseIndex] = course; localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses)); return course; };
export const getPostById = (id: string): ForumPost | undefined => getForumPosts().find(p => p.id === id);
export const toggleLikePost = (id: string) => { const posts = getForumPosts(); const postIndex = posts.findIndex(p => p.id === id); if (postIndex !== -1) { const post = posts[postIndex]; if(post.isLiked) { post.likes = Math.max(0, post.likes - 1); post.isLiked = false; } else { post.likes += 1; post.isLiked = true; addXP(5, 'Liked a post'); checkActionBadges('like'); } posts[postIndex] = post; localStorage.setItem(STORAGE_KEYS.FORUM, JSON.stringify(posts)); return post; } return undefined; }
export const toggleCommentReaction = (postId: string, commentId: string, emoji: string) => { const posts = getForumPosts(); const post = posts.find(p => p.id === postId); const user = getUser(); if (post) { const updateRec = (comments: Comment[]): boolean => { for (let c of comments) { if (c.id === commentId) { if (!c.reactions) c.reactions = {}; if (!c.reactions[emoji]) c.reactions[emoji] = []; const idx = c.reactions[emoji].indexOf(user.id); if (idx !== -1) c.reactions[emoji].splice(idx, 1); else c.reactions[emoji].push(user.id); return true; } if (c.replies && updateRec(c.replies)) return true; } return false; }; updateRec(post.comments); localStorage.setItem(STORAGE_KEYS.FORUM, JSON.stringify(posts)); } return post; }
export const addCommentToPost = (postId: string, comment: Comment, parentId?: string) => { const posts = getForumPosts(); const post = posts.find(p => p.id === postId); if (post && !post.isLocked) { if (!post.comments) post.comments = []; comment.timestamp = new Date().toISOString(); if (parentId) { const addRec = (comments: Comment[]): boolean => { for (let c of comments) { if (c.id === parentId) { if (!c.replies) c.replies = []; c.replies.push(comment); return true; } if (c.replies && addRec(c.replies)) return true; } return false; }; addRec(post.comments); } else { post.comments.push(comment); } post.repliesCount++; localStorage.setItem(STORAGE_KEYS.FORUM, JSON.stringify(posts)); addXP(10, 'Commented on Topic'); checkActionBadges('comment'); } return post; }
export const getChats = (): Conversation[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]');
export const saveChats = (chats: Conversation[]) => localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
export const updateChat = (chat: Conversation) => { const chats = getChats(); const i = chats.findIndex(c => c.id === chat.id); if (i !== -1) { chats[i] = chat; saveChats(chats); } return chats; }
export const unsendMessage = (cid: string, mid: string) => { const chats = getChats(); const chat = chats.find(c => c.id === cid); if (chat) { const m = chat.messages.find(msg => msg.id === mid); if (m) { m.isUnsent = true; m.reactions = {}; saveChats(chats); } } return chats; }
export const restoreMessage = (cid: string, mid: string) => { const chats = getChats(); const chat = chats.find(c => c.id === cid); if(chat) { const m = chat.messages.find(msg => msg.id === mid); if(m) { m.isUnsent = false; saveChats(chats); }} return chats; }
export const deleteMessageForUser = (cid: string, mid: string, uid: string) => { const chats = getChats(); const chat = chats.find(c => c.id === cid); if(chat) { const m = chat.messages.find(msg => msg.id === mid); if(m) { if(!m.deletedFor) m.deletedFor = []; m.deletedFor.push(uid); saveChats(chats); } } return chats; }
export const deleteConversation = (cid: string) => { const chats = getChats().filter(c => c.id !== cid); saveChats(chats); return chats; }
export const addSystemMessage = (cid: string, text: string) => { const chats = getChats(); const chat = chats.find(c => c.id === cid); if(chat) { chat.messages = [...chat.messages, { id: Date.now().toString(), senderId: 'system', text, time: new Date().toISOString(), type: 'system', reactions: {} }]; chat.lastMessage = text; saveChats(chats); } return chats; }
export const createOrGetDirectChat = (tid: string, tname: string, tavatar: string) => { const chats = getChats(); const uid = getUser().id; const exists = chats.find(c => !c.isGroup && c.participants.includes(tid) && c.participants.includes(uid)); if(exists) return exists.id; const nc: Conversation = { id: Date.now().toString(), isGroup: false, name: tname, avatar: tavatar, participants: [uid, tid], lastMessage: 'Start chatting...', unreadCount: 0, time: 'Just now', messages: [], status: 'online' }; chats.unshift(nc); saveChats(chats); return nc.id; }
export const addMemberToGroup = (cid: string, uid: string, actorName: string = 'Someone') => { let chats = getChats(); const c = chats.find(x => x.id === cid); const userToAdd = getUserById(uid); if(c && c.isGroup && !c.participants.includes(uid)) { c.participants.push(uid); saveChats(chats); return addSystemMessage(cid, `${actorName} added ${userToAdd?.name || 'a new member'}`); } return chats; }
export const removeMemberFromGroup = (cid: string, uid: string, actorName: string = 'Someone') => { let chats = getChats(); const c = chats.find(x => x.id === cid); const userToRemove = getUserById(uid); if(c && c.isGroup) { c.participants = c.participants.filter(id => id !== uid); if(c.admins) c.admins = c.admins.filter(id => id !== uid); if(c.moderators) c.moderators = c.moderators.filter(id => id !== uid); saveChats(chats); return addSystemMessage(cid, `${actorName} removed ${userToRemove?.name || 'a member'}`); } return chats; }
export const leaveGroup = (cid: string, uid: string) => { let chats = getChats(); const c = chats.find(x => x.id === cid); const leavingUser = getUserById(uid); if(c && c.isGroup) { c.participants = c.participants.filter(id => id !== uid); if(c.admins) c.admins = c.admins.filter(id => id !== uid); if(c.moderators) c.moderators = c.moderators.filter(id => id !== uid); saveChats(chats); const updatedChats = addSystemMessage(cid, `${leavingUser?.name || 'Someone'} left the group`); return updatedChats.filter(ch => ch.participants.includes(uid)); } return chats; }
export const promoteToAdmin = (cid: string, uid: string, actorName: string = 'Someone') => { let chats = getChats(); const c = chats.find(x => x.id === cid); const targetUser = getUserById(uid); if(c && c.isGroup) { if(!c.admins) c.admins=[]; if(!c.admins.includes(uid)) { c.admins.push(uid); if(c.moderators) c.moderators = c.moderators.filter(x => x !== uid); saveChats(chats); return addSystemMessage(cid, `${actorName} promoted ${targetUser?.name || 'member'} to Admin`); } } return chats; }
export const demoteAdmin = (cid: string, uid: string, actorName: string = 'Someone') => { let chats = getChats(); const c = chats.find(x => x.id === cid); const targetUser = getUserById(uid); if(c && c.isGroup && c.admins) { c.admins = c.admins.filter(x => x !== uid); saveChats(chats); return addSystemMessage(cid, `${actorName} demoted ${targetUser?.name || 'Admin'}`); } return chats; }
export const promoteToModerator = (cid: string, uid: string, actorName: string = 'Someone') => { let chats = getChats(); const c = chats.find(x => x.id === cid); const targetUser = getUserById(uid); if(c && c.isGroup) { if(!c.moderators) c.moderators=[]; if(!c.moderators.includes(uid) && !c.admins?.includes(uid)) { c.moderators.push(uid); saveChats(chats); return addSystemMessage(cid, `${actorName} promoted ${targetUser?.name || 'member'} to Moderator`); } } return chats; }
export const demoteModerator = (cid: string, uid: string, actorName: string = 'Someone') => { let chats = getChats(); const c = chats.find(x => x.id === cid); const targetUser = getUserById(uid); if(c && c.isGroup && c.moderators) { c.moderators = c.moderators.filter(x => x !== uid); saveChats(chats); return addSystemMessage(cid, `${actorName} demoted ${targetUser?.name || 'Moderator'}`); } return chats; }
export const getSharedLinks = (cid: string) => { const chats = getChats(); const chat = chats.find(c => c.id === cid); const links: {url: string; date: string}[] = []; const rx = /(https?:\/\/[^\s]+)/g; if(chat) chat.messages.forEach(m => { if(!m.isUnsent && m.type !== 'system' && !m.deletedFor?.includes(getUser().id)) { const matches = m.text.match(rx); if(matches) matches.forEach(u => links.push({url: u, date: new Date(m.time).toLocaleDateString()})); }}); const grouped: {[d: string]: string[]} = {}; links.forEach(l => { if(!grouped[l.date]) grouped[l.date] = []; grouped[l.date].push(l.url); }); return grouped; }
export const getSharedImages = (cid: string) => { const chats = getChats(); const chat = chats.find(c => c.id === cid); const images: {url: string; date: string}[] = []; if(chat) { chat.messages.forEach(m => { if(!m.isUnsent && m.type === 'image' && m.fileUrl && !m.deletedFor?.includes(getUser().id)) { images.push({url: m.fileUrl, date: new Date(m.time).toLocaleDateString()}); } }); } const grouped: {[d: string]: string[]} = {}; images.forEach(img => { if(!grouped[img.date]) grouped[img.date] = []; grouped[img.date].push(img.url); }); return grouped; }
export const getSharedFiles = (cid: string) => { const chats = getChats(); const chat = chats.find(c => c.id === cid); const files: {name: string; url: string; date: string}[] = []; if(chat) { chat.messages.forEach(m => { if(!m.isUnsent && m.type === 'file' && m.fileUrl && !m.deletedFor?.includes(getUser().id)) { files.push({name: m.text, url: m.fileUrl, date: new Date(m.time).toLocaleDateString()}); } }); } const grouped: {[d: string]: {name: string, url: string}[]} = {}; files.forEach(f => { if(!grouped[f.date]) grouped[f.date] = []; grouped[f.date].push({name: f.name, url: f.url}); }); return grouped; }
export const getCertificates = (): Certificate[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES) || '[]');
export const issueCertificate = (courseId: string, score: number): string => { const user = getUser(); const course = getCourseById(courseId); if (!course) throw new Error("Course not found"); 
const instructorName = course.instructors.length > 0 ? course.instructors[0].name : "EduPro Instructors";
const certId = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`; const newCert: Certificate = { id: certId, courseId, courseName: course.title, studentName: user.name, issueDate: new Date().toLocaleDateString(), instructorName: instructorName, score }; const certs = getCertificates(); certs.push(newCert); localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs)); user.certificates.push(certId); localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); dispatchUserUpdate(user); addXP(500, 'Earned Certificate'); return certId; };
export const revokeCertificate = (userId: string, certId: string) => {
    let allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        // Remove from user's certificate list
        allUsers[userIndex].certificates = allUsers[userIndex].certificates.filter(cid => cid !== certId);
        saveAllUsers(allUsers);
        
        // Also remove from global certificates storage if it should be completely deleted
        let allCerts = getCertificates();
        const updatedCerts = allCerts.filter(c => c.id !== certId);
        localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(updatedCerts));

        if(getUser().id === userId) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(allUsers[userIndex]));
            dispatchUserUpdate(allUsers[userIndex]);
        }
        return allUsers[userIndex];
    }
    return null;
}
export const getCertificateById = (id: string): Certificate | undefined => getCertificates().find(c => c.id === id);
export const banUser = (userId: string, type: 'banned_temp' | 'banned_perm', durationDays?: number) => { const users = getAllUsers(); const index = users.findIndex(u => u.id === userId); if(index !== -1) { users[index].accountStatus = type; users[index].banExpires = (type === 'banned_temp' && durationDays) ? new Date(Date.now() + durationDays * 86400000).toISOString() : undefined; saveAllUsers(users); const msg = type === 'banned_perm' ? 'You have been permanently banned.' : `You have been banned for ${durationDays} days.`; notifyUser(userId, 'Account Suspended', msg, 'warning'); if(getUser().id === userId) { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(users[index])); dispatchUserUpdate(users[index]); } } return users; };
export const warnUser = (userId: string, message: string) => { notifyUser(userId, 'Admin Warning', message, 'warning'); };
export const activateUser = (userId: string) => { const users = getAllUsers(); const idx = users.findIndex(u => u.id === userId); if(idx !== -1) { users[idx].accountStatus = 'active'; users[idx].banExpires = undefined; saveAllUsers(users); notifyUser(userId, 'Account Reactivated', 'Your account has been reactivated.', 'success'); } return users; };
export const deleteUserSystem = (userId: string) => { let users = getAllUsers(); const updatedUsers = users.filter(u => u.id !== userId); saveAllUsers(updatedUsers); const chats = getChats(); const updatedChats = chats.map(c => ({ ...c, participants: c.participants.filter(pid => pid !== userId), admins: c.admins?.filter(aid => aid !== userId), moderators: c.moderators?.filter(mid => mid !== userId) })).filter(c => c.participants.length > 0); saveChats(updatedChats); return updatedUsers; };

// --- REVIEW SYSTEM ---
export const addCourseReview = (courseId: string, rating: number, comment: string) => {
    const user = getUser();
    const courses = getCourses();
    const index = courses.findIndex(c => c.id === courseId);
    
    if(index !== -1) {
        const course = courses[index];
        if(!course.reviews) course.reviews = [];
        
        // Check if user already reviewed
        const existingIdx = course.reviews.findIndex(r => r.userId === user.id);
        
        if (existingIdx !== -1) {
            // Update existing review
            course.reviews[existingIdx].rating = rating;
            course.reviews[existingIdx].comment = comment;
            course.reviews[existingIdx].date = new Date().toISOString();
        } else {
            // Add new review
            const newReview: Review = {
                id: `rev_${Date.now()}`,
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar,
                rating,
                comment,
                date: new Date().toISOString()
            };
            course.reviews.unshift(newReview);
        }

        // Recalculate Rating
        const totalStars = course.reviews.reduce((acc, r) => acc + r.rating, 0);
        course.rating = parseFloat((totalStars / course.reviews.length).toFixed(1));
        course.reviewsCount = course.reviews.length;

        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
        return course;
    }
    return undefined;
};

export const deleteCourseReview = (courseId: string, reviewId: string) => {
    const courses = getCourses();
    const index = courses.findIndex(c => c.id === courseId);
    if(index !== -1) {
        const course = courses[index];
        if(course.reviews) {
            course.reviews = course.reviews.filter(r => r.id !== reviewId);
            
            // Recalculate Rating
            if (course.reviews.length > 0) {
                const totalStars = course.reviews.reduce((acc, r) => acc + r.rating, 0);
                course.rating = parseFloat((totalStars / course.reviews.length).toFixed(1));
            } else {
                course.rating = 0;
            }
            course.reviewsCount = course.reviews.length;
            
            localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
            return course;
        }
    }
    return undefined;
};
