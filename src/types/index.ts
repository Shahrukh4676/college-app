export type UserRole = 'STUDENT';

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  college: string;
  course: string;
  yearOfStudy: number; // e.g. 1, 2, 3, 4
  bio: string;
  skills: string[];
  avatarUrl?: string;
  rating: number; // e.g. 4.9
  reviewCount: number;
  completedTasksCount: number;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthSession {
  user: StudentProfile;
  tokens: AuthTokens;
}

export type TaskCategory =
  | 'TUTORING'
  | 'NOTES_SUMMARY'
  | 'CODING_DEBUG'
  | 'RESEARCH_EDITING'
  | 'MATH_STATS'
  | 'PRESENTATIONS'
  | 'DESIGN_CREATIVE'
  | 'CAMPUS_ERRANDS'
  | 'OTHER';

export type TaskStatus =
  | 'OPEN'
  | 'HELPER_SELECTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  budgetInr: number;
  deadline: string; // ISO date string
  requiredSkills: string[];
  status: TaskStatus;
  requesterId: string;
  requesterName: string;
  requesterAvatarUrl?: string;
  requesterCollege: string;
  requesterRating: number;
  helperId?: string;
  helperName?: string;
  helperAvatarUrl?: string;
  offersCount: number;
  attachments?: TaskAttachment[];
  submissionNotes?: string;
  submissionAttachments?: TaskAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  category: TaskCategory;
  budgetInr: number;
  deadline: string;
  requiredSkills: string[];
  attachments?: TaskAttachment[];
}

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Offer {
  id: string;
  taskId: string;
  taskTitle: string;
  taskBudgetInr: number;
  helperId: string;
  helperName: string;
  helperCollege: string;
  helperAvatarUrl?: string;
  helperRating: number;
  helperCompletedTasks: number;
  offerAmountInr: number;
  estimatedDeliveryHours: number;
  proposal: string;
  status: OfferStatus;
  createdAt: string;
}

export interface SubmitOfferPayload {
  taskId: string;
  offerAmountInr: number;
  estimatedDeliveryHours: number;
  proposal: string;
}

export interface Conversation {
  id: string;
  taskId: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  participant: {
    id: string;
    fullName: string;
    college: string;
    avatarUrl?: string;
    isOnline?: boolean;
  };
  lastMessage?: {
    id: string;
    text: string;
    timestamp: string;
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  attachments?: MessageAttachment[];
  timestamp: string;
  isRead: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export type NotificationType =
  | 'NEW_OFFER'
  | 'OFFER_ACCEPTED'
  | 'NEW_MESSAGE'
  | 'WORK_SUBMITTED'
  | 'TASK_COMPLETED'
  | 'PAYMENT_UPDATE'
  | 'REVIEW_RECEIVED'
  | 'SAFETY_ALERT';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string; // taskId or conversationId
  entityType?: 'task' | 'chat' | 'payment';
  isRead: boolean;
  createdAt: string;
}

export type TransactionType = 'ESCROW_DEPOSIT' | 'EARNING_PAYOUT' | 'REFUND' | 'PLATFORM_FEE';
export type TransactionStatus = 'INITIATED' | 'ESCROWED' | 'RELEASED' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  id: string;
  taskId: string;
  taskTitle: string;
  amountInr: number;
  type: TransactionType;
  status: TransactionStatus;
  referenceId: string;
  createdAt: string;
}

export interface EarningStats {
  totalEarnedInr: number;
  pendingEscrowInr: number;
  completedTasksCount: number;
  activeTasksCount: number;
  averageRating: number;
}

export interface Review {
  id: string;
  taskId: string;
  taskTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerCollege: string;
  reviewerAvatarUrl?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  taskId: string;
  rating: number;
  comment: string;
}

export type ReportTargetType = 'TASK' | 'USER' | 'MESSAGE';
export interface ReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  explanation?: string;
}
