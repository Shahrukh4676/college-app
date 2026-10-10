import {
  StudentProfile,
  Task,
  CreateTaskPayload,
  Offer,
  SubmitOfferPayload,
  Conversation,
  Message,
  AppNotification,
  Transaction,
  EarningStats,
  Review,
  CreateReviewPayload,
  ReportPayload,
} from '@/types';
import {
  CURRENT_MOCK_USER,
  INITIAL_MOCK_TASKS,
  INITIAL_MOCK_OFFERS,
  INITIAL_MOCK_CONVERSATIONS,
  INITIAL_MOCK_MESSAGES,
  INITIAL_MOCK_NOTIFICATIONS,
  INITIAL_MOCK_TRANSACTIONS,
  MOCK_EARNING_STATS,
  INITIAL_MOCK_REVIEWS,
} from './mockData';

// Simulated delay helper
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

class MockDatabase {
  private user: StudentProfile = { ...CURRENT_MOCK_USER };
  private tasks: Task[] = [...INITIAL_MOCK_TASKS];
  private offers: Offer[] = [...INITIAL_MOCK_OFFERS];
  private conversations: Conversation[] = [...INITIAL_MOCK_CONVERSATIONS];
  private messages: Record<string, Message[]> = { ...INITIAL_MOCK_MESSAGES };
  private notifications: AppNotification[] = [...INITIAL_MOCK_NOTIFICATIONS];
  private transactions: Transaction[] = [...INITIAL_MOCK_TRANSACTIONS];
  private earningStats: EarningStats = { ...MOCK_EARNING_STATS };
  private reviews: Review[] = [...INITIAL_MOCK_REVIEWS];

  // Auth
  async login(email: string): Promise<{ user: StudentProfile; token: string }> {
    await delay(300);
    this.user.email = email;
    return {
      user: { ...this.user },
      token: 'mock_jwt_token_' + Date.now(),
    };
  }

  async register(data: {
    fullName: string;
    email: string;
    college: string;
    course: string;
    yearOfStudy: number;
  }): Promise<{ user: StudentProfile; token: string }> {
    await delay(400);
    this.user = {
      ...this.user,
      id: 'usr_' + Date.now(),
      ...data,
      bio: 'New member at ' + data.college,
      skills: ['General Academic Assistance'],
      rating: 5.0,
      reviewCount: 0,
      completedTasksCount: 0,
      createdAt: new Date().toISOString(),
    };
    return {
      user: { ...this.user },
      token: 'mock_jwt_token_' + Date.now(),
    };
  }

  async getMe(): Promise<StudentProfile> {
    await delay(150);
    return { ...this.user };
  }

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    await delay(300);
    this.user = { ...this.user, ...updates };
    return { ...this.user };
  }

  // Tasks
  async getTasks(params?: {
    category?: string;
    search?: string;
    status?: string;
  }): Promise<Task[]> {
    await delay(250);
    let result = [...this.tasks];

    if (params?.category && params.category !== 'ALL') {
      result = result.filter((t) => t.category === params.category);
    }
    if (params?.status && params.status !== 'ALL') {
      result = result.filter((t) => t.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTaskById(id: string): Promise<Task | null> {
    await delay(150);
    const task = this.tasks.find((t) => t.id === id);
    return task ? { ...task } : null;
  }

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    await delay(350);
    const newTask: Task = {
      id: 'tsk_' + Date.now(),
      title: payload.title,
      description: payload.description,
      category: payload.category,
      budgetInr: payload.budgetInr,
      deadline: payload.deadline,
      requiredSkills: payload.requiredSkills,
      status: 'OPEN',
      requesterId: this.user.id,
      requesterName: this.user.fullName,
      requesterAvatarUrl: this.user.avatarUrl,
      requesterCollege: this.user.college,
      requesterRating: this.user.rating,
      offersCount: 0,
      attachments: payload.attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);
    return { ...newTask };
  }

  async updateTaskStatus(
    taskId: string,
    status: Task['status'],
    notes?: string
  ): Promise<Task> {
    await delay(300);
    const idx = this.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error('Task not found');
    this.tasks[idx].status = status;
    this.tasks[idx].updatedAt = new Date().toISOString();
    if (notes) {
      this.tasks[idx].submissionNotes = notes;
    }
    return { ...this.tasks[idx] };
  }

  // Offers
  async getOffersForTask(taskId: string): Promise<Offer[]> {
    await delay(200);
    return this.offers.filter((o) => o.taskId === taskId);
  }

  async getMyOffers(): Promise<Offer[]> {
    await delay(200);
    return this.offers.filter((o) => o.helperId === this.user.id);
  }

  async submitOffer(payload: SubmitOfferPayload): Promise<Offer> {
    await delay(350);
    const task = this.tasks.find((t) => t.id === payload.taskId);
    if (!task) throw new Error('Task not found');

    const newOffer: Offer = {
      id: 'off_' + Date.now(),
      taskId: payload.taskId,
      taskTitle: task.title,
      taskBudgetInr: task.budgetInr,
      helperId: this.user.id,
      helperName: this.user.fullName,
      helperCollege: this.user.college,
      helperAvatarUrl: this.user.avatarUrl,
      helperRating: this.user.rating,
      helperCompletedTasks: this.user.completedTasksCount,
      offerAmountInr: payload.offerAmountInr,
      estimatedDeliveryHours: payload.estimatedDeliveryHours,
      proposal: payload.proposal,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.offers.unshift(newOffer);
    task.offersCount += 1;
    return { ...newOffer };
  }

  async acceptOffer(offerId: string): Promise<{ task: Task; offer: Offer }> {
    await delay(300);
    const offer = this.offers.find((o) => o.id === offerId);
    if (!offer) throw new Error('Offer not found');
    const task = this.tasks.find((t) => t.id === offer.taskId);
    if (!task) throw new Error('Task not found');

    offer.status = 'ACCEPTED';
    task.status = 'IN_PROGRESS';
    task.helperId = offer.helperId;
    task.helperName = offer.helperName;
    task.helperAvatarUrl = offer.helperAvatarUrl;

    // Reject other pending offers
    this.offers
      .filter((o) => o.taskId === task.id && o.id !== offerId)
      .forEach((o) => {
        o.status = 'REJECTED';
      });

    return { task: { ...task }, offer: { ...offer } };
  }

  async rejectOffer(offerId: string): Promise<Offer> {
    await delay(200);
    const offer = this.offers.find((o) => o.id === offerId);
    if (!offer) throw new Error('Offer not found');
    offer.status = 'REJECTED';
    return { ...offer };
  }

  // Chat & Messaging
  async getConversations(): Promise<Conversation[]> {
    await delay(200);
    return [...this.conversations];
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    await delay(200);
    return this.messages[conversationId] ? [...this.messages[conversationId]] : [];
  }

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    await delay(200);
    const newMessage: Message = {
      id: 'msg_' + Date.now(),
      conversationId,
      senderId: this.user.id,
      senderName: this.user.fullName,
      text,
      timestamp: new Date().toISOString(),
      isRead: true,
      status: 'sent',
    };

    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(newMessage);

    // Update conversation lastMessage
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = {
        id: newMessage.id,
        text: newMessage.text,
        timestamp: newMessage.timestamp,
        senderId: newMessage.senderId,
        isRead: true,
      };
      conv.updatedAt = newMessage.timestamp;
    }

    return { ...newMessage };
  }

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    await delay(200);
    return [...this.notifications];
  }

  async markNotificationRead(id: string): Promise<void> {
    await delay(100);
    const item = this.notifications.find((n) => n.id === id);
    if (item) item.isRead = true;
  }

  // Payments & Earnings
  async getEarningStats(): Promise<EarningStats> {
    await delay(200);
    return { ...this.earningStats };
  }

  async getTransactions(): Promise<Transaction[]> {
    await delay(200);
    return [...this.transactions];
  }

  // Reviews
  async getReviewsForUser(userId: string): Promise<Review[]> {
    await delay(200);
    return this.reviews;
  }

  async submitReview(payload: CreateReviewPayload): Promise<Review> {
    await delay(300);
    const newRev: Review = {
      id: 'rev_' + Date.now(),
      taskId: payload.taskId,
      taskTitle: 'Peer Academic Assistance',
      reviewerId: this.user.id,
      reviewerName: this.user.fullName,
      reviewerCollege: this.user.college,
      reviewerAvatarUrl: this.user.avatarUrl,
      rating: payload.rating,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
    };
    this.reviews.unshift(newRev);
    return { ...newRev };
  }

  // Safety
  async submitReport(payload: ReportPayload): Promise<{ success: boolean; message: string }> {
    await delay(300);
    return {
      success: true,
      message: 'Your report has been submitted to campus moderators for review.',
    };
  }
}

export const MockAdapter = new MockDatabase();
