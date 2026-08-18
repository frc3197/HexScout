import { User } from "../types/users/User.ts";
import type { RobotPhoto } from "../types/scouting/RobotImage.ts";
import type { ScoutForm, ScoutFormHistoryEntry } from "../types/scouting/ScoutForm.ts";

type ImageMetadata = Omit<RobotPhoto, 'data'>;
type ScoutFormInput = Pick<ScoutForm, 'eventCode' | 'matchNumber' | 'teamNumber' | 'formVersion' | 'data'> & {
  uuid?: string;
  submittingScouterUuid?: string;
};
type ScoutFormUpdate = Partial<Pick<ScoutFormInput, 'eventCode' | 'matchNumber' | 'teamNumber' | 'formVersion' | 'data'>>;
type UserInput = { name: string; pin: string; roleName?: string };
type UserUpdate = { name?: string; pin?: string; roleName?: string; active?: boolean };
type UserResponse = Parameters<typeof User.fromJSON>[0];
type JsonResponse = { error?: string };

// Every JSON endpoint uses the same authenticated request contract.
type RequestOptions = Omit<RequestInit, 'credentials'>;

// API responses serialize dates as strings; restore the shared model shape here.
function parseScoutHistory(entry: ScoutFormHistoryEntry): ScoutFormHistoryEntry {
  return {
    ...entry,
    modifiedAt: new Date(entry.modifiedAt),
  };
}

function parseScoutForm(form: ScoutForm & { history?: ScoutFormHistoryEntry[] }): ScoutForm {
  return {
    ...form,
    createdAt: new Date(form.createdAt),
    uploadedAt: new Date(form.uploadedAt),
    history: (form.history ?? []).map(parseScoutHistory),
  };
}

/**
 * The Class for the Wrapped API
 */
export class HexWrapper {
  readonly url: string;
  readonly auth: {
    login: (name: string, pin: string) => Promise<User>;
    logout: () => Promise<{ success: boolean }>;
  };
  readonly db: {
    clearTable: (table: 'scout' | 'users' | 'images') => Promise<{ success: boolean }>;
    exportTable: (table: 'scout' | 'users' | 'images') => Promise<Blob>;
  };
  readonly images: {
    upload: (image: Blob, teamNumber: number) => Promise<ImageMetadata>;
    list: (teamNumber?: number) => Promise<ImageMetadata[]>;
    get: (id: string) => Promise<Blob>;
    delete: (id: string) => Promise<{ success: boolean }>;
  };
  readonly scout: {
    create: (forms: ScoutFormInput | ScoutFormInput[]) => Promise<ScoutForm[]>;
    get: (filters?: { eventCode?: string; teamNumber?: number }) => Promise<ScoutForm[]>;
    getById: (uuid: string) => Promise<ScoutForm>;
    update: (uuid: string, update: ScoutFormUpdate) => Promise<ScoutForm>;
    delete: (uuid: string) => Promise<{ success: boolean }>;
  };
  readonly status: {
    check: () => Promise<boolean>;
  };
  readonly users: {
    getCurrent: () => Promise<User>;
    get: () => Promise<User[]>;
    create: (input: UserInput) => Promise<User>;
    update: (uuid: string, update: UserUpdate) => Promise<User>;
    delete: (uuid: string) => Promise<{ success: boolean }>;
  };

  /**
    * @param url the base URL of the API. Do not include /api; a trailing slash is allowed
   */
  constructor(url: string) {
    this.url = url.replace(/\/$/, '');
    this.auth = {
      login: this.login.bind(this),
      logout: this.logout.bind(this),
    };
    this.db = {
      clearTable: this.clearTable.bind(this),
      exportTable: this.exportTable.bind(this),
    };
    this.images = {
      upload: this.uploadImage.bind(this),
      list: this.getImages.bind(this),
      get: this.getImage.bind(this),
      delete: this.deleteImage.bind(this),
    };
    this.scout = {
      create: this.createScoutForms.bind(this),
      get: this.getScoutForms.bind(this),
      getById: this.getScoutForm.bind(this),
      update: this.updateScoutForm.bind(this),
      delete: this.deleteScoutForm.bind(this),
    };
    this.status = {
      check: this.statusCheck.bind(this),
    };
    this.users = {
      getCurrent: this.getCurrentUser.bind(this),
      get: this.getUsers.bind(this),
      create: this.createUser.bind(this),
      update: this.updateUser.bind(this),
      delete: this.deleteUser.bind(this),
    };
  }

  private endpoint(path: string): string {
    return this.url + path;
  }

  // Centralize credentials, JSON decoding, and the API's error response format.
  private async request<T>(path: string, options: RequestOptions = {}, fallback: string): Promise<T> {
    const response = await fetch(this.endpoint(path), {
      ...options,
      credentials: 'include',
    });
    const body = await response.json().catch(() => ({})) as T & JsonResponse;

    if (!response.ok) {
      throw new Error(body.error ?? fallback);
    }

    return body;
  }

  // Binary endpoints cannot go through the JSON response pipeline.
  private async requestBlob(path: string, fallback: string): Promise<Blob> {
    const response = await fetch(this.endpoint(path), { credentials: 'include' });

    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as JsonResponse;
      throw new Error(body.error ?? fallback);
    }

    return response.blob();
  }

  // AUTH API: session creation and destruction.

  /**
   * Auth
   * @param name The name of the user you want to log in as
   * @param pin Their pin
   * @returns the user object 
   */
  private async login(name: string, pin: string): Promise<User> {
    const body = await this.request<{ user: UserResponse }>('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pin })
    }, 'Authentication failed')

    return User.fromJSON(body.user)
  }

  /**
   * Logout
   * @returns If successful, fail likely means there was no login in the firstplace
   */
  private async logout(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }, 'Logout failed')
  }

  // DB API: administrative table operations and file exports.

  private async clearTable(table: 'scout' | 'users' | 'images'): Promise<{ success: boolean }> {
    const body = await this.request<{ success?: boolean }>('/api/db/clear/' + table, {}, 'Cannot clear table')
    return { success: body.success === true }
  }

  private async exportTable(table: 'scout' | 'users' | 'images'): Promise<Blob> {
    return this.requestBlob('/api/db/export/' + table, 'Cannot export table')
  }


  // IMAGE API: metadata is JSON; image content is returned as a Blob.

  private async uploadImage(image: Blob, teamNumber: number): Promise<ImageMetadata> {
    const form = new FormData()
    form.append('image', image)
    form.append('teamNumber', teamNumber.toString())

    const body = await this.request<{ image: ImageMetadata }>('/api/image', {
      method: 'POST',
      body: form,
    }, 'Cannot upload image')

    return {
      ...body.image,
      createdAt: new Date(body.image.createdAt),
    }
  }

  private async getImages(teamNumber?: number): Promise<ImageMetadata[]> {
    const query = teamNumber === undefined ? '' : `?teamNumber=${encodeURIComponent(teamNumber)}`
    const body = await this.request<{ images?: ImageMetadata[] }>('/api/image' + query, {}, 'Cannot fetch images')

    return (body.images ?? []).map(image => ({
      ...image,
      createdAt: new Date(image.createdAt),
    }))
  }

  private async getImage(id: string): Promise<Blob> {
    return this.requestBlob('/api/image/' + encodeURIComponent(id), 'Cannot fetch image')
  }

  private async deleteImage(id: string): Promise<{ success: boolean }> {
    return this.deleteResource('/api/image/' + encodeURIComponent(id), 'Cannot delete image')
  }

  // SCOUT API: form submission supports one form or a batch.

  private async createScoutForms(forms: ScoutFormInput | ScoutFormInput[]): Promise<ScoutForm[]> {
    const body = await this.request<{ forms?: ScoutForm[] }>('/api/scout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forms),
    }, 'Cannot create scout forms')

    return (body.forms ?? []).map(parseScoutForm)
  }

  private async getScoutForms(filters: { eventCode?: string; teamNumber?: number } = {}): Promise<ScoutForm[]> {
    const query = new URLSearchParams()
    if (filters.eventCode !== undefined) query.set('eventCode', filters.eventCode)
    if (filters.teamNumber !== undefined) query.set('teamNumber', filters.teamNumber.toString())
    const suffix = query.toString() ? '?' + query.toString() : ''
    const body = await this.request<{ forms?: ScoutForm[] }>('/api/scout' + suffix, {}, 'Cannot fetch scout forms')

    return (body.forms ?? []).map(parseScoutForm)
  }

  private async getScoutForm(uuid: string): Promise<ScoutForm> {
    const body = await this.request<{ form: ScoutForm & { history?: ScoutFormHistoryEntry[] } }>(
      '/api/scout/' + encodeURIComponent(uuid), {}, 'Cannot fetch scout form'
    )

    return parseScoutForm(body.form)
  }

  private async updateScoutForm(uuid: string, update: ScoutFormUpdate): Promise<ScoutForm> {
    const body = await this.request<{ form: ScoutForm }>('/api/scout/' + encodeURIComponent(uuid), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    }, 'Cannot update scout form')

    return parseScoutForm(body.form)
  }

  private async deleteScoutForm(uuid: string): Promise<{ success: boolean }> {
    return this.deleteResource('/api/scout/' + encodeURIComponent(uuid), 'Cannot delete scout form')
  }

  // STATUS API: health failures are represented as false for easy polling.

  private async statusCheck(): Promise<boolean> {
    try {
      await this.request('/api/status', {}, 'Status check failed')
      return true
    } catch {
      return false
    }
  }

  // USERS API: convert public JSON user records into User instances.

  private async getCurrentUser(): Promise<User> {
    return this.getUser('/api/users/me', 'Cannot fetch current user')
  }

  private async getUsers(): Promise<User[]> {
    const body = await this.request<{ users?: UserResponse[] }>('/api/users', {}, 'Cannot fetch users')

    return (body.users ?? []).map(user => User.fromJSON(user))
  }

  private async createUser(input: UserInput): Promise<User> {
    return this.sendUser('/api/users', 'POST', input, 'Cannot create user')
  }

  private async updateUser(uuid: string, update: UserUpdate): Promise<User> {
    return this.sendUser('/api/users/' + encodeURIComponent(uuid), 'PATCH', update, 'Cannot update user')
  }

  private async deleteUser(uuid: string): Promise<{ success: boolean }> {
    return this.deleteResource('/api/users/' + encodeURIComponent(uuid), 'Cannot delete user')
  }

  private async getUser(path: string, fallback: string): Promise<User> {
    const body = await this.request<{ user: UserResponse }>(path, {}, fallback)
    return User.fromJSON(body.user)
  }

  private async sendUser(path: string, method: 'POST' | 'PATCH', payload: UserInput | UserUpdate, fallback: string): Promise<User> {
    const body = await this.request<{ user: UserResponse }>(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, fallback)
    return User.fromJSON(body.user)
  }

  private async deleteResource(path: string, fallback: string): Promise<{ success: boolean }> {
    const body = await this.request<{ success?: boolean }>(path, { method: 'DELETE' }, fallback)
    return { success: body.success === true }
  }
}

export default HexWrapper