import { User } from '../types';

const STORAGE_KEY = 'noelia_users';
const CURRENT_USER_KEY = 'noelia_current_session';

// Seed default users if none exist
const seedUsers = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const defaultUsers: User[] = [
      {
        id: '1',
        name: 'System Admin',
        email: 'admin@noelia.ai',
        role: 'admin',
        isActive: true,
        password: 'admin123', // In a real app, this would be hashed
        lastLogin: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Lead Analyst',
        email: 'user@noelia.ai',
        role: 'user',
        isActive: true,
        password: 'user123',
        lastLogin: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
  }
};

seedUsers();

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const usersStr = localStorage.getItem(STORAGE_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account has been disabled by an administrator');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return user;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Admin Methods
  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(STORAGE_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  addUser: (user: Omit<User, 'id' | 'lastLogin'>) => {
    const users = authService.getUsers();
    if (users.some(u => u.email === user.email)) {
      throw new Error('User with this email already exists');
    }
    
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      lastLogin: '-'
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return newUser;
  },

  updateUserStatus: (id: string, isActive: boolean) => {
    const users = authService.getUsers();
    const updatedUsers = users.map(u => u.id === id ? { ...u, isActive } : u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
  },

  deleteUser: (id: string) => {
    const users = authService.getUsers();
    const updatedUsers = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
  }
};