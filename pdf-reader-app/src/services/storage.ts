export type StoredBookMeta = {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: number;
};

const DB_NAME = 'book-reader-db';
const DB_VERSION = 1;
const STORE_FILES = 'files';
const STORE_META = 'meta';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES);
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        const meta = db.createObjectStore(STORE_META, { keyPath: 'id' });
        meta.createIndex('createdAt', 'createdAt');
      }
    };
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

export async function saveBook(id: string, file: File, name?: string): Promise<StoredBookMeta> {
  const db = await openDb();
  const tx = db.transaction([STORE_FILES, STORE_META], 'readwrite');
  const meta: StoredBookMeta = {
    id,
    name: name ?? file.name ?? id,
    size: file.size,
    type: file.type || 'application/pdf',
    createdAt: Date.now(),
  };
  await new Promise<void>((resolve, reject) => {
    const putFile = tx.objectStore(STORE_FILES).put(file, id);
    putFile.onerror = () => reject(putFile.error);
    putFile.onsuccess = () => resolve();
  });
  await new Promise<void>((resolve, reject) => {
    const putMeta = tx.objectStore(STORE_META).put(meta);
    putMeta.onerror = () => reject(putMeta.error);
    putMeta.onsuccess = () => resolve();
  });
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();
  return meta;
}

export async function listBooks(): Promise<StoredBookMeta[]> {
  const db = await openDb();
  const tx = db.transaction(STORE_META, 'readonly');
  const metas = await new Promise<StoredBookMeta[]>((resolve, reject) => {
    const req = tx.objectStore(STORE_META).getAll();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result as StoredBookMeta[]);
  });
  db.close();
  return metas.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getBook(id: string): Promise<File | null> {
  const db = await openDb();
  const tx = db.transaction(STORE_FILES, 'readonly');
  const file = await new Promise<File | null>((resolve, reject) => {
    const req = tx.objectStore(STORE_FILES).get(id);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve((req.result as File) ?? null);
  });
  db.close();
  return file;
}

export async function deleteBook(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction([STORE_FILES, STORE_META], 'readwrite');
  await new Promise<void>((resolve, reject) => {
    const req = tx.objectStore(STORE_FILES).delete(id);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
  await new Promise<void>((resolve, reject) => {
    const req = tx.objectStore(STORE_META).delete(id);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();
}


