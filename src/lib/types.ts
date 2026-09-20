export type Profile = {
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  referralCode: string;
  referredBy: string | null;
  status: string;
  language: string;
  notificationsEnabled: boolean;
  telegramId: string | null;
  pointsBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  tasksCompleted: number;
  dailyStreak: number;
  lastDailyClaim: string | null;
  isAdmin: boolean;
  isDemo: boolean;
  createdAt: string;
};

export type TaskCategory =
  | "telegram"
  | "website"
  | "social"
  | "sponsored"
  | "affiliate"
  | "daily";

export type VerificationType =
  | "visit_token"
  | "admin_approval"
  | "telegram_membership"
  | "unique_token"
  | "sponsor_callback";

export type TaskRow = {
  id: number;
  title: string;
  description: string;
  category: string;
  rewardPoints: number;
  targetUrl: string | null;
  verificationType: string;
  maxCompletions: number | null;
  completionCount: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  sponsorName: string | null;
  campaignId: number | null;
  minDwellSeconds: number;
  isFeatured: boolean;
  isDemo: boolean;
  userState: "available" | "started" | "pending" | "completed" | "rejected" | "expired";
  startedAt: string | null;
  token: string | null;
};

export type TxRow = {
  id: number;
  type: string;
  amount: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
};

export type RewardRow = {
  id: number;
  title: string;
  description: string;
  pointsCost: number;
  paymentMethod: string;
  stock: number | null;
  status: string;
};

export type WithdrawalRow = {
  id: number;
  points: number;
  rewardTitle: string | null;
  paymentMethod: string;
  accountMasked: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
};

export type NotificationRow = {
  id: number;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  points: number;
  isDemo: boolean;
  isYou: boolean;
};

export type TicketRow = {
  id: number;
  category: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export const TASK_CATEGORIES = [
  "telegram",
  "website",
  "social",
  "sponsored",
  "affiliate",
  "daily",
] as const;

export const TX_LABELS: Record<string, string> = {
  daily_reward: "Daily reward",
  task_reward: "Task reward",
  referral_reward: "Referral",
  bonus: "Bonus",
  admin_adjustment: "Admin adjustment",
  withdrawal: "Redemption",
  reversal: "Reversal",
};

export const PAYMENT_METHODS = ["easypaisa", "jazzcash", "bank", "voucher"] as const;
