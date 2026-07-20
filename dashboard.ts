export interface DashboardMessage {
  id: string;
  link: string;
  createdAt: number; // timestamp
  expiryAt: number; // timestamp
  templateType: string;
  status: 'created' | 'opened' | 'destroyed';
  openedAt?: number;
  destroyedAt?: number;
}

const DASHBOARD_PREFIX = 'secret_';
const DASHBOARD_STORAGE_KEY = 'secrets_dashboard';

/**
 * Save message to dashboard (localStorage)
 */
export function saveDashboardMessage(message: DashboardMessage): void {
  try {
    if (typeof window === 'undefined') return; // SSR safety
    
    const key = `${DASHBOARD_PREFIX}${message.id}`;
    localStorage.setItem(key, JSON.stringify(message));
    
    // Also add to index for easier retrieval
    updateDashboardIndex(message.id);
  } catch (error) {
    console.error('Error saving to dashboard:', error);
  }
}

/**
 * Get all dashboard messages
 */
export function getDashboardMessages(): DashboardMessage[] {
  try {
    if (typeof window === 'undefined') return []; // SSR safety
    
    const messages: DashboardMessage[] = [];
    const now = Date.now();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (!key || !key.startsWith(DASHBOARD_PREFIX)) continue;
      
      const item = localStorage.getItem(key);
      if (!item) continue;
      
      try {
        const message = JSON.parse(item) as DashboardMessage;
        
        // Auto-cleanup: remove if expired more than 24 hours ago
        if (now > message.expiryAt + 24 * 60 * 60 * 1000) {
          localStorage.removeItem(key);
          continue;
        }
        
        messages.push(message);
      } catch (error) {
        console.error(`Error parsing dashboard message ${key}:`, error);
        localStorage.removeItem(key);
      }
    }
    
    return messages.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error retrieving dashboard messages:', error);
    return [];
  }
}

/**
 * Get single dashboard message
 */
export function getDashboardMessage(id: string): DashboardMessage | null {
  try {
    if (typeof window === 'undefined') return null; // SSR safety
    
    const key = `${DASHBOARD_PREFIX}${id}`;
    const item = localStorage.getItem(key);
    
    if (!item) return null;
    
    const message = JSON.parse(item) as DashboardMessage;
    
    // Cleanup if expired
    const now = Date.now();
    if (now > message.expiryAt + 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    
    return message;
  } catch (error) {
    console.error('Error retrieving dashboard message:', error);
    return null;
  }
}

/**
 * Update message status in dashboard
 */
export function updateDashboardMessageStatus(
  id: string,
  status: 'opened' | 'destroyed',
  timestamp: number
): void {
  try {
    if (typeof window === 'undefined') return; // SSR safety
    
    const message = getDashboardMessage(id);
    if (!message) return;
    
    message.status = status;
    
    if (status === 'opened') {
      message.openedAt = timestamp;
    } else if (status === 'destroyed') {
      message.destroyedAt = timestamp;
    }
    
    saveDashboardMessage(message);
  } catch (error) {
    console.error('Error updating dashboard message:', error);
  }
}

/**
 * Remove message from dashboard
 */
export function removeDashboardMessage(id: string): void {
  try {
    if (typeof window === 'undefined') return; // SSR safety
    
    const key = `${DASHBOARD_PREFIX}${id}`;
    localStorage.removeItem(key);
    updateDashboardIndex(id, true);
  } catch (error) {
    console.error('Error removing dashboard message:', error);
  }
}

/**
 * Update dashboard index (for faster retrieval)
 */
function updateDashboardIndex(id: string, remove: boolean = false): void {
  try {
    if (typeof window === 'undefined') return; // SSR safety
    
    const indexStr = localStorage.getItem(DASHBOARD_STORAGE_KEY) || '[]';
    let index: string[] = JSON.parse(indexStr);
    
    if (remove) {
      index = index.filter(itemId => itemId !== id);
    } else if (!index.includes(id)) {
      index.push(id);
    }
    
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(index));
  } catch (error) {
    console.error('Error updating dashboard index:', error);
  }
}

/**
 * Clear expired messages from dashboard
 */
export function clearExpiredMessages(): void {
  try {
    if (typeof window === 'undefined') return; // SSR safety
    
    const now = Date.now();
    const messages = getDashboardMessages();
    
    for (const message of messages) {
      if (now > message.expiryAt + 24 * 60 * 60 * 1000) {
        removeDashboardMessage(message.id);
      }
    }
  } catch (error) {
    console.error('Error clearing expired messages:', error);
  }
}
