import { UserProfile, LogEntry, LeaderboardEntry } from '../types';

const STORAGE_KEY = 'mygreenmirror_user';

const MOCK_FRIENDS: LeaderboardEntry[] = [
  { id: '2', name: 'Alice Green', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', points: 450, isCurrentUser: false, rank: 0 },
  { id: '3', name: 'Bob Solar', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', points: 320, isCurrentUser: false, rank: 0 },
  { id: '4', name: 'Charlie Compost', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', points: 580, isCurrentUser: false, rank: 0 },
  { id: '5', name: 'Dana Wind', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dana', points: 120, isCurrentUser: false, rank: 0 },
];

export const getUser = (): UserProfile | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const createGuestUser = (): UserProfile => {
  return {
    id: `guest-${Date.now()}`,
    name: 'Guest Explorer',
    email: '',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
    totalPoints: 0,
    streakDays: 1,
    logs: [],
    isGuest: true
  };
};

export const loginUser = async (guestUserToMerge?: UserProfile): Promise<UserProfile> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const stored = localStorage.getItem(STORAGE_KEY);
  let finalUser: UserProfile;

  if (stored) {
    finalUser = JSON.parse(stored);
    // Merge guest data if exists
    if (guestUserToMerge && guestUserToMerge.logs.length > 0) {
      finalUser = {
        ...finalUser,
        totalPoints: finalUser.totalPoints + guestUserToMerge.totalPoints,
        logs: [...guestUserToMerge.logs, ...finalUser.logs]
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalUser));
    }
  } else {
    // Create new user, potentially carrying over guest data
    finalUser = {
      id: '1',
      name: 'Eco Warrior',
      email: 'user@example.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      totalPoints: guestUserToMerge ? guestUserToMerge.totalPoints : 0,
      streakDays: 1,
      logs: guestUserToMerge ? guestUserToMerge.logs : [],
      isGuest: false
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalUser));
  }
  return finalUser;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const saveLog = (user: UserProfile, log: LogEntry): UserProfile => {
  const updatedUser = {
    ...user,
    totalPoints: user.totalPoints + log.pointsEarned,
    logs: [log, ...user.logs]
  };
  
  // Only persist if not a guest
  if (!user.isGuest) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  }
  
  return updatedUser;
};

export const deleteLog = (user: UserProfile, logId: string): UserProfile => {
  const logToDelete = user.logs.find(l => l.id === logId);
  if (!logToDelete) return user;

  const updatedUser = {
    ...user,
    totalPoints: Math.max(0, user.totalPoints - logToDelete.pointsEarned),
    logs: user.logs.filter(l => l.id !== logId)
  };

  if (!user.isGuest) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  }
  return updatedUser;
};

export const getLeaderboard = (currentUser: UserProfile): LeaderboardEntry[] => {
  const currentEntry: LeaderboardEntry = {
    id: currentUser.id,
    name: currentUser.name,
    avatarUrl: currentUser.avatarUrl,
    points: currentUser.totalPoints,
    isCurrentUser: true,
    rank: 0
  };

  // If user is guest, they are just added to the list for display purposes
  const all = [...MOCK_FRIENDS, currentEntry].sort((a, b) => b.points - a.points);
  return all.map((entry, index) => ({ ...entry, rank: index + 1 }));
};