import { User, Subject, Question, Flashcard, CheatSheet, Progress, StudySession, StoreItem, ChatMessage, QuizResult } from '@/types';

class AppStore {
  private currentUser: User | null = null;
  private subjects: Subject[] = [];
  private questions: Question[] = [];
  private flashcards: Flashcard[] = [];
  private cheatSheets: CheatSheet[] = [];
  private progress: Progress[] = [];
  private studySessions: StudySession[] = [];
  private storeItems: StoreItem[] = [];
  private chatMessages: ChatMessage[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeStore();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('smart-exam-prep-data');
    if (stored) {
      const data = JSON.parse(stored);
      this.currentUser = data.currentUser || null;
      this.subjects = data.subjects || [];
      this.questions = data.questions || [];
      this.flashcards = data.flashcards || [];
      this.cheatSheets = data.cheatSheets || [];
      this.progress = data.progress || [];
      this.studySessions = data.studySessions || [];
      this.storeItems = data.storeItems || [];
      this.chatMessages = data.chatMessages || [];
    }
  }

  private saveToStorage() {
    const data = {
      currentUser: this.currentUser,
      subjects: this.subjects,
      questions: this.questions,
      flashcards: this.flashcards,
      cheatSheets: this.cheatSheets,
      progress: this.progress,
      studySessions: this.studySessions,
      storeItems: this.storeItems,
      chatMessages: this.chatMessages,
    };
    localStorage.setItem('smart-exam-prep-data', JSON.stringify(data));
  }

  private initializeStore() {
    if (this.storeItems.length === 0) {
      this.storeItems = [
        {
          id: '1',
          name: 'Scholar Badge',
          description: 'Show your dedication to learning',
          price: 100,
          type: 'badge',
          imageUrl: '/badges/scholar.png',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Master Banner',
          description: 'Display your expertise',
          price: 250,
          type: 'banner',
          imageUrl: '/banners/master.png',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Genius Avatar',
          description: 'Unique avatar for top performers',
          price: 150,
          type: 'avatar',
          imageUrl: '/avatars/genius.png',
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveToStorage();
    }
  }

  // User methods
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    // Mock authentication - in real app this would call API
    if (email === 'demo@example.com' && password === 'password') {
      this.currentUser = {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
        coins: 500,
        createdAt: new Date().toISOString(),
      };
      this.saveToStorage();
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: 'Invalid credentials' };
  }

  async signup(email: string, password: string, name: string): Promise<{ success: boolean; message: string }> {
    // Mock signup
    this.currentUser = {
      id: Date.now().toString(),
      email,
      name,
      coins: 100, // Starting coins
      createdAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return { success: true, message: 'Account created successfully' };
  }

  logout() {
    this.currentUser = null;
    this.saveToStorage();
  }

  updateUserCoins(coins: number) {
    if (this.currentUser) {
      this.currentUser.coins = coins;
      this.saveToStorage();
    }
  }

  // Subject methods
  getSubjects(): Subject[] {
    if (!this.currentUser) return [];
    return this.subjects.filter(s => s.userId === this.currentUser.id);
  }

  addSubject(subject: Omit<Subject, 'id' | 'userId' | 'createdAt'>): Subject {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString(),
      userId: this.currentUser.id,
      questionsCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    this.subjects.push(newSubject);
    this.saveToStorage();
    return newSubject;
  }

  updateSubject(id: string, updates: Partial<Subject>): Subject | null {
    const index = this.subjects.findIndex(s => s.id === id);
    if (index !== -1) {
      this.subjects[index] = { ...this.subjects[index], ...updates };
      this.saveToStorage();
      return this.subjects[index];
    }
    return null;
  }

  deleteSubject(id: string): boolean {
    const index = this.subjects.findIndex(s => s.id === id);
    if (index !== -1) {
      this.subjects.splice(index, 1);
      // Also delete related data
      this.questions = this.questions.filter(q => q.subjectId !== id);
      this.flashcards = this.flashcards.filter(f => f.subjectId !== id);
      this.cheatSheets = this.cheatSheets.filter(c => c.subjectId !== id);
      this.progress = this.progress.filter(p => p.subjectId !== id);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Question methods
  getQuestions(subjectId?: string): Question[] {
    if (subjectId) {
      return this.questions.filter(q => q.subjectId === subjectId);
    }
    return this.questions;
  }

  async generateQuiz(subjectId: string, topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number): Promise<Question[]> {
    // Mock quiz generation - in real app this would call Gemini API
    const mockQuestions: Question[] = [];
    
    for (let i = 0; i < count; i++) {
      const question: Question = {
        id: Date.now().toString() + i,
        subjectId,
        text: `What is the main concept of ${topic}? (Question ${i + 1})`,
        options: [
          'Option A - Basic understanding',
          'Option B - Advanced concept',
          'Option C - Intermediate level',
          'Option D - Expert knowledge'
        ],
        correctIndex: Math.floor(Math.random() * 4),
        explanation: `This question tests your understanding of ${topic}. The correct answer provides the most comprehensive explanation.`,
        difficulty,
        createdAt: new Date().toISOString(),
      };
      mockQuestions.push(question);
    }
    
    this.questions.push(...mockQuestions);
    
    // Update subject question count
    const subject = this.subjects.find(s => s.id === subjectId);
    if (subject) {
      subject.questionsCount += count;
    }
    
    this.saveToStorage();
    return mockQuestions;
  }

  submitQuizResults(subjectId: string, results: QuizResult) {
    if (!this.currentUser) return;

    // Update progress
    let progressRecord = this.progress.find(p => p.userId === this.currentUser!.id && p.subjectId === subjectId);
    
    if (!progressRecord) {
      progressRecord = {
        id: Date.now().toString(),
        userId: this.currentUser.id,
        subjectId,
        quizzesCompleted: 0,
        accuracy: 0,
        updatedAt: new Date().toISOString(),
      };
      this.progress.push(progressRecord);
    }

    // Calculate new accuracy
    const newAccuracy = (progressRecord.accuracy * progressRecord.quizzesCompleted + (results.score / results.totalQuestions * 100)) / (progressRecord.quizzesCompleted + 1);
    
    progressRecord.quizzesCompleted += 1;
    progressRecord.accuracy = newAccuracy;
    progressRecord.updatedAt = new Date().toISOString();

    // Award coins based on performance
    const coinsEarned = Math.floor((results.score / results.totalQuestions) * 50);
    this.currentUser.coins += coinsEarned;

    this.saveToStorage();
  }

  // Flashcard methods
  getFlashcards(subjectId?: string): Flashcard[] {
    if (!this.currentUser) return [];
    let cards = this.flashcards.filter(f => f.userId === this.currentUser.id);
    if (subjectId) {
      cards = cards.filter(f => f.subjectId === subjectId);
    }
    return cards;
  }

  addFlashcard(flashcard: Omit<Flashcard, 'id' | 'userId' | 'createdAt'>): Flashcard {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: Date.now().toString(),
      userId: this.currentUser.id,
      createdAt: new Date().toISOString(),
    };
    
    this.flashcards.push(newFlashcard);
    this.saveToStorage();
    return newFlashcard;
  }

  // CheatSheet methods
  getCheatSheets(subjectId?: string): CheatSheet[] {
    if (!this.currentUser) return [];
    let sheets = this.cheatSheets.filter(c => c.userId === this.currentUser.id);
    if (subjectId) {
      sheets = sheets.filter(c => c.subjectId === subjectId);
    }
    return sheets;
  }

  async generateCheatSheet(subjectId: string, topic: string): Promise<CheatSheet> {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    // Mock cheat sheet generation - in real app this would call Gemini API
    const cheatSheet: CheatSheet = {
      id: Date.now().toString(),
      userId: this.currentUser.id,
      subjectId,
      title: `${topic} - Study Guide`,
      content: `# ${topic} Study Guide

## Key Concepts
- Fundamental principles
- Important definitions
- Core methodologies

## Quick Reference
- Essential formulas
- Important dates
- Key figures

## Practice Points
- Common mistakes to avoid
- Exam tips
- Memory techniques

This cheat sheet was generated to help you study ${topic} effectively.`,
      createdAt: new Date().toISOString(),
    };
    
    this.cheatSheets.push(cheatSheet);
    this.saveToStorage();
    return cheatSheet;
  }

  // Progress methods
  getProgress(): Progress[] {
    if (!this.currentUser) return [];
    return this.progress.filter(p => p.userId === this.currentUser.id);
  }

  getProgressSummary(): { labels: string[]; scores: number[] } {
    const userProgress = this.getProgress();
    const subjects = this.getSubjects();
    
    const labels = subjects.map(s => s.name);
    const scores = subjects.map(s => {
      const prog = userProgress.find(p => p.subjectId === s.id);
      return prog ? prog.accuracy : 0;
    });
    
    return { labels, scores };
  }

  // Study session methods
  startStudySession(subjectId: string): StudySession {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    const session: StudySession = {
      id: Date.now().toString(),
      userId: this.currentUser.id,
      subjectId,
      startTime: new Date().toISOString(),
      durationMinutes: 0,
    };
    
    this.studySessions.push(session);
    this.saveToStorage();
    return session;
  }

  stopStudySession(sessionId: string): StudySession | null {
    const session = this.studySessions.find(s => s.id === sessionId);
    if (session && !session.endTime) {
      const endTime = new Date();
      const startTime = new Date(session.startTime);
      session.endTime = endTime.toISOString();
      session.durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      
      // Award coins for study time
      const coinsEarned = Math.floor(session.durationMinutes / 10) * 5; // 5 coins per 10 minutes
      if (this.currentUser) {
        this.currentUser.coins += coinsEarned;
      }
      
      this.saveToStorage();
      return session;
    }
    return null;
  }

  getStudyHistory(days: number = 7): { date: string; minutes: number }[] {
    if (!this.currentUser) return [];
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const sessions = this.studySessions.filter(s => 
      s.userId === this.currentUser!.id && 
      new Date(s.startTime) >= startDate
    );
    
    const dailyStats: { [key: string]: number } = {};
    
    sessions.forEach(session => {
      const date = new Date(session.startTime).toISOString().split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + session.durationMinutes;
    });
    
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(endDate.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      result.unshift({
        date: dateStr,
        minutes: dailyStats[dateStr] || 0,
      });
    }
    
    return result;
  }

  // Store methods
  getStoreItems(): StoreItem[] {
    return this.storeItems;
  }

  purchaseStoreItem(itemId: string): { success: boolean; message: string } {
    if (!this.currentUser) return { success: false, message: 'User not authenticated' };
    
    const item = this.storeItems.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found' };
    
    if (this.currentUser.coins < item.price) {
      return { success: false, message: 'Insufficient coins' };
    }
    
    this.currentUser.coins -= item.price;
    
    // Apply the item to user
    if (item.type === 'avatar') {
      this.currentUser.avatar = item.imageUrl;
    } else if (item.type === 'banner') {
      this.currentUser.banner = item.imageUrl;
    } else if (item.type === 'badge') {
      this.currentUser.badge = item.imageUrl;
    }
    
    this.saveToStorage();
    return { success: true, message: 'Purchase successful!' };
  }

  // Chat methods
  async sendMessage(message: string): Promise<string> {
    // Mock chat response - in real app this would call Gemini API
    const responses = [
      "That's an interesting question! Let me help you understand this concept better.",
      "Great question! Here's what you need to know about this topic.",
      "I can help you with that. Let's break it down step by step.",
      "This is a common area where students need clarification. Here's the explanation:",
      "Perfect timing for this question! This concept is important for your studies.",
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)] + 
      ` For the topic of "${message}", I recommend focusing on the fundamental principles and practicing with related questions.`;
    
    if (this.currentUser) {
      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: this.currentUser.id,
        message,
        response,
        createdAt: new Date().toISOString(),
      };
      
      this.chatMessages.push(chatMessage);
      this.saveToStorage();
    }
    
    return response;
  }

  getChatHistory(): ChatMessage[] {
    if (!this.currentUser) return [];
    return this.chatMessages.filter(c => c.userId === this.currentUser.id);
  }
}

export const appStore = new AppStore();