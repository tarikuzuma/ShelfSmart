// Subscription management utility
// Stores subscriptions in localStorage: { userId: [retailerId1, retailerId2, ...] }

export interface Subscriptions {
  [userId: string]: number[];
}

const STORAGE_KEY = "retailer_subscriptions";

export function getSubscriptions(): Subscriptions {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function getUserSubscriptions(userId: string | number): number[] {
  const subscriptions = getSubscriptions();
  return subscriptions[String(userId)] || [];
}

export function subscribeToRetailer(userId: string | number, retailerId: number): void {
  const subscriptions = getSubscriptions();
  const userIdStr = String(userId);
  const userSubs = subscriptions[userIdStr] || [];
  
  if (!userSubs.includes(retailerId)) {
    subscriptions[userIdStr] = [...userSubs, retailerId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  }
}

export function unsubscribeFromRetailer(userId: string | number, retailerId: number): void {
  const subscriptions = getSubscriptions();
  const userIdStr = String(userId);
  const userSubs = subscriptions[userIdStr] || [];
  
  subscriptions[userIdStr] = userSubs.filter(id => id !== retailerId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
}

export function isSubscribedToRetailer(userId: string | number, retailerId: number): boolean {
  const userSubs = getUserSubscriptions(userId);
  return userSubs.includes(retailerId);
}

export function getCurrentUserId(): string | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return String(user.id);
  } catch {
    return null;
  }
}
