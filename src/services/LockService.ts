/**
 * LockService handles the local storage logic for the App Lock system.
 * It stores the lock status, type, and credentials locally.
 */

import { storage } from './StorageService';

export type LockType = 'pin4' | 'pin6' | 'alpha' | null;

interface LockData {
  isEnabled: boolean;
  type: LockType;
  hash: string | null; // In a real app, this would be hashed. For this demo, we'll store the value.
}

const STORAGE_KEY = 'grixchat_app_lock';

export const LockService = {
  getLockData: (): LockData => {
    const data = storage.getItem(STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Error parsing lock data", e);
      }
    }
    return { isEnabled: false, type: null, hash: null };
  },

  setLockData: (data: LockData) => {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  enableLock: (type: LockType, value: string) => {
    const data: LockData = {
      isEnabled: true,
      type,
      hash: value
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  disableLock: () => {
    const data: LockData = {
      isEnabled: false,
      type: null,
      hash: null
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  verifyLock: (value: string): boolean => {
    const data = LockService.getLockData();
    return data.hash === value;
  }
};
