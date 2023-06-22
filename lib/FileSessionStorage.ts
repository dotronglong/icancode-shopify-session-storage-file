import {Session} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import * as fs from 'fs';
import {join} from 'path';

export interface FileSessionStorageOptions {
  location: string;
}

const defaultFileSessionStorageOptions: FileSessionStorageOptions = {
  location: '.sessions',
};

/**
 * FileSessionStorage
 */
export class FileSessionStorage implements SessionStorage {
  private options: FileSessionStorageOptions;
  private directorySession: string;

  /**
   * Constructor
   * @param {FileSessionStorageOptions} options
   */
  constructor(options?: FileSessionStorageOptions) {
    this.options = {...defaultFileSessionStorageOptions, ...options};
    this.directorySession = join(process.cwd(), this.options.location);
  }

  /**
   * Store session
   * @param {Session} session
   * @return {Promise<boolean>}
   */
  storeSession(session: Session): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.checkLocalStorage();
        const fileName = `${session.id}.json`;
        fs.writeFileSync(
            join(this.directorySession, fileName),
            JSON.stringify(session.toObject()),
        );
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Load session
   * @param {string} id
   * @return {Promise<any>}
   */
  loadSession(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.checkLocalStorage();
        const filePath = join(this.directorySession, `${id}.json`);
        if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
          const data = JSON.parse(
              fs.readFileSync(filePath, {encoding: 'utf8'}),
          );
          const session = new Session(data);
          resolve(session);
        } else {
          resolve(undefined);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Delete session
   * @param {string} id
   * @return {Promise<boolean>}
   */
  deleteSession(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.checkLocalStorage();
        const filePath = join(this.directorySession, `${id}.json`);
        if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
          fs.rmSync(filePath);
        }
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Delete sessions
   * @param {string[]} ids
   * @return {Promise<boolean>}
   */
  deleteSessions(ids: string[]): Promise<boolean> {
    const tasks: Promise<boolean>[] = [];
    for (const id of ids) {
      tasks.push(this.deleteSession(id));
    }

    return Promise.all(tasks).then(() => true);
  }

  /**
   * Find sessions by shop
   * @param {string} shop
   * @return {Promise<Session[]>}
   */
  findSessionsByShop(shop: string): Promise<Session[]> {
    return new Promise(async (resolve, reject) => {
      try {
        this.checkLocalStorage();
        const sessions: Session[] = [];
        const names = fs.readdirSync(this.directorySession);
        for (const name of names) {
          if (name.match(/\.json$/)) {
            const id = name.replace(/\.json$/, '');
            const session = (await this.loadSession(id) as Session);
            if (session.shop === shop) {
              sessions.push(session);
            }
          }
        }
        resolve(sessions);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Check and ensure session's folder exists
   */
  private checkLocalStorage() {
    if (!fs.existsSync(this.directorySession)) {
      // create session's directory
      fs.mkdirSync(this.directorySession);
    }
    if (!fs.lstatSync(this.directorySession).isDirectory()) {
      // eslint-disable-next-line
      throw new Error(`Unable to create sessions' directory ${this.directorySession}`);
    }
  }
}
