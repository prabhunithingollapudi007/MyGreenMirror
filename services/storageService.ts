import { UserProfile, LogEntry, LeaderboardEntry } from '../types';

const STORAGE_KEY = 'mygreenmirror_user';

const MOCK_FRIENDS: LeaderboardEntry[] = [
  { id: '2', name: 'Alice Green', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', points: 450, isCurrentUser: false, rank: 0 },
  { id: '3', name: 'Bob Solar', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', points: 320, isCurrentUser: false, rank: 0 },
  { id: '4', name: 'Charlie Compost', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', points: 580, isCurrentUser: false, rank: 0 },
  { id: '5', name: 'Dana Wind', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dana', points: 120, isCurrentUser: false, rank: 0 },
];

export const loginUser = async (): Promise<UserProfile> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  const newUser: UserProfile = {
    id: '1',
    name: 'Eco Warrior',
    email: 'user@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    totalPoints: 0,
    streakDays: 1,
    logs: []
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
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

  const all = [...MOCK_FRIENDS, currentEntry].sort((a, b) => b.points - a.points);
  return all.map((entry, index) => ({ ...entry, rank: index + 1 }));
};