const en = {
  home: "Home",
  tasks: "Tasks",
  play: "Play",
  ranks: "Ranks",
  profile: "Profile",
  friends: "Friends",
  wallet: "Wallet",
  welcome: "Welcome back",
  claim: "Claim",
  balance: "Balance",
  pending: "Pending",
  paid: "Paid",
  rejected: "Rejected",
  save: "Save",
};

const ur: typeof en = {
  home: "ہوم",
  tasks: "ٹاسکس",
  play: "گیم",
  ranks: "رینک",
  profile: "پروفائل",
  friends: "دوست",
  wallet: "والٹ",
  welcome: "خوش آمدید",
  claim: "کلیم",
  balance: "بیلنس",
  pending: "زیر التوا",
  paid: "ادا شدہ",
  rejected: "مسترد",
  save: "محفوظ",
};

export type Lang = "en" | "ur";

export function t(lang: Lang | string | undefined, key: keyof typeof en): string {
  const L = lang === "ur" ? ur : en;
  return L[key] ?? en[key];
}

export { en, ur };
