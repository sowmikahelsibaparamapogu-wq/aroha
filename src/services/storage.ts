/**
 * IndexedDB and Local Offline Storage Engine for AROHA
 * Supports offline drafts, document queueing, and admin offline caching.
 */

import { Application, DocumentUpload, SchemeType } from '../types/scholarship';

const DB_NAME = 'aroha_offline_db';
const DB_VERSION = 1;

export class StorageEngine {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  public static async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'scheme' });
        }
        if (!db.objectStoreNames.contains('applications')) {
          db.createObjectStore('applications', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('document_queue')) {
          db.createObjectStore('document_queue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Draft Applications ---
  public static async saveDraft(draft: Partial<Application> & { scheme: SchemeType }): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('drafts', 'readwrite');
      const store = tx.objectStore('drafts');
      store.put({
        ...draft,
        updatedAt: new Date().toISOString(),
      });
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Fallback to localStorage for draft save', e);
      localStorage.setItem(`aroha_draft_${draft.scheme}`, JSON.stringify(draft));
    }
  }

  public static async getDraft(scheme: SchemeType): Promise<Partial<Application> | null> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('drafts', 'readonly');
      const store = tx.objectStore('drafts');
      const req = store.get(scheme);
      return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Fallback to localStorage for draft get', e);
      const val = localStorage.getItem(`aroha_draft_${scheme}`);
      return val ? JSON.parse(val) : null;
    }
  }

  public static async clearDraft(scheme: SchemeType): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('drafts', 'readwrite');
      tx.objectStore('drafts').delete(scheme);
      localStorage.removeItem(`aroha_draft_${scheme}`);
    } catch (e) {
      localStorage.removeItem(`aroha_draft_${scheme}`);
    }
  }

  public static async clearAllDrafts(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('drafts', 'readwrite');
      tx.objectStore('drafts').clear();
      localStorage.removeItem('aroha_draft_NFST');
      localStorage.removeItem('aroha_draft_NOS');
    } catch (e) {
      localStorage.removeItem('aroha_draft_NFST');
      localStorage.removeItem('aroha_draft_NOS');
    }
  }

  // --- Offline Document Queue ---
  public static async queueDocument(doc: DocumentUpload): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('document_queue', 'readwrite');
      tx.objectStore('document_queue').put(doc);
    } catch (e) {
      const queue = this.getLocalQueue();
      queue.push(doc);
      localStorage.setItem('aroha_queued_docs', JSON.stringify(queue));
    }
  }

  public static async getQueuedDocuments(): Promise<DocumentUpload[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('document_queue', 'readonly');
      const store = tx.objectStore('document_queue');
      const req = store.getAll();
      return new Promise((resolve) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(this.getLocalQueue());
      });
    } catch (e) {
      return this.getLocalQueue();
    }
  }

  public static async clearQueuedDocuments(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('document_queue', 'readwrite');
      tx.objectStore('document_queue').clear();
      localStorage.removeItem('aroha_queued_docs');
    } catch (e) {
      localStorage.removeItem('aroha_queued_docs');
    }
  }

  private static getLocalQueue(): DocumentUpload[] {
    const raw = localStorage.getItem('aroha_queued_docs');
    return raw ? JSON.parse(raw) : [];
  }

  // --- Admin Cache & Applications ---
  public static async saveApplications(apps: Application[]): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['applications', 'meta'], 'readwrite');
      const appStore = tx.objectStore('applications');
      const metaStore = tx.objectStore('meta');

      apps.forEach((app) => appStore.put(app));
      metaStore.put({ key: 'last_sync', value: new Date().toISOString() });
    } catch (e) {
      localStorage.setItem('aroha_cached_apps', JSON.stringify(apps));
      localStorage.setItem('aroha_last_sync', new Date().toISOString());
    }
  }

  public static async getApplications(): Promise<Application[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('applications', 'readonly');
      const store = tx.objectStore('applications');
      const req = store.getAll();
      return new Promise((resolve) => {
        req.onsuccess = () => {
          if (req.result && req.result.length > 0) {
            resolve(req.result);
          } else {
            const raw = localStorage.getItem('aroha_cached_apps');
            resolve(raw ? JSON.parse(raw) : []);
          }
        };
        req.onerror = () => {
          const raw = localStorage.getItem('aroha_cached_apps');
          resolve(raw ? JSON.parse(raw) : []);
        };
      });
    } catch (e) {
      const raw = localStorage.getItem('aroha_cached_apps');
      return raw ? JSON.parse(raw) : [];
    }
  }

  public static async getLastSyncTimestamp(): Promise<string> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('meta', 'readonly');
      const req = tx.objectStore('meta').get('last_sync');
      return new Promise((resolve) => {
        req.onsuccess = () => resolve(req.result?.value || new Date().toISOString());
        req.onerror = () => resolve(localStorage.getItem('aroha_last_sync') || new Date().toISOString());
      });
    } catch (e) {
      return localStorage.getItem('aroha_last_sync') || new Date().toISOString();
    }
  }
}
