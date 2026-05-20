import { useState } from "react";
import { toast } from "sonner";

interface UsePassphraseRecoveryReturn {
  isRecovering: boolean;
  error: string | null;
  recoverKey: (username: string, passphrase: string) => Promise<string | null>;
  clearError: () => void;
}

/**
 * Hook for managing passphrase-based key recovery
 */
export function usePassphraseRecovery(): UsePassphraseRecoveryReturn {
  const [isRecovering, setIsRecovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recoverKey = async (username: string, passphrase: string): Promise<string | null> => {
    setIsRecovering(true);
    setError(null);

    try {
      const res = await fetch("/api/chat/recover-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, passphrase }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Key recovered successfully!");
        return data.privateKey;
      } else {
        const errorMsg = data.error || "Recovery failed";
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = "Network error during recovery";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
      return null;
    } finally {
      setIsRecovering(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isRecovering,
    error,
    recoverKey,
    clearError,
  };
}

/**
 * Store private key in IndexedDB
 */
export async function storeKeyLocally(username: string, privateKey: string): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("keys", "readwrite");
      const store = tx.objectStore("keys");
      const request = store.put(privateKey, username);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Error storing key:", error);
    throw new Error("Failed to store key locally");
  }
}

/**
 * Retrieve private key from IndexedDB
 */
export async function getKeyLocally(username: string): Promise<string | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("keys", "readonly");
      const store = tx.objectStore("keys");
      const request = store.get(username);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch (error) {
    console.error("Error retrieving key:", error);
    return null;
  }
}

/**
 * Clear private key from IndexedDB
 */
export async function clearKeyLocally(username: string): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("keys", "readwrite");
      const store = tx.objectStore("keys");
      const request = store.delete(username);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Error clearing key:", error);
  }
}

/**
 * Open or create IndexedDB database
 */
async function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("NoTraceChat", 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    };
  });
}
