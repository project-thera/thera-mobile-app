import PouchDB from 'pouchdb-core';
PouchDB.plugin(require('pouchdb-adapter-asyncstorage').default);

import {ApiClient} from 'jsonapi-react-native';
import schema from '../models/schema';

import {API_URL} from '../../config/config';

const LOCAL_USER_KEY = 'current';
const LOCAL_DATABASE_NAME = 'thera';

export default class Database {
  static instance = null;
  static apiClient = null;

  constructor() {
    this.localDatabase = new PouchDB(LOCAL_DATABASE_NAME, {
      adapter: 'asyncstorage',
    });
  }

  static getInstance() {
    if (Database.instance == null) {
      Database.instance = new Database();
    }

    return this.instance;
  }

  async getCurrentUser() {
    const currentUser = await this.localDatabase.get(LOCAL_USER_KEY);

    return currentUser;
  }

  async setCurrentUser(user) {
    try {
      await this.removeCurrentUser();
    } catch {}

    console.log('Set current');

    const currentUser = {...user, routineIntents: [], _id: LOCAL_USER_KEY};
    const output = await this.localDatabase.put(currentUser);

    return output;
  }

  async removeCurrentUser() {
    this.apiClient = null;
    const currentUser = await this.localDatabase.get(LOCAL_USER_KEY);

    return this.localDatabase.remove(currentUser);
  }

  async getApiClient() {
    if (Database.apiClient) {
      return Database.apiClient;
    }

    const currentUser = await this.getCurrentUser();

    Database.apiClient = new ApiClient({
      url: API_URL,
      schema,
      headers: {
        'X-CSRF-Token': currentUser.token,
      },
      fetchOptions: {
        credentials: 'include',
      },
    });

    return Database.apiClient;
  }

  async getRoutines() {
    const currentUser = await this.getCurrentUser();

    return currentUser.routines;
  }

  async getRoutineIntent(routine) {
    return {
      routineId: routine.id,
      startedAt: new Date().toISOString(), // TODO check this
      finishedAt: null,
      routineIntentExercises: [],
    };
  }

  async addRoutineIntent(routineIntent) {
    const currentUser = await this.getCurrentUser();

    currentUser.routineIntents.push(routineIntent);

    return this.localDatabase.put(currentUser);
  }

  async syncRoutines() {
    const currentUser = await this.getCurrentUser();
    const apiClient = await this.getApiClient();

    const {data, error} = await apiClient.fetch([
      'routines',
      {
        include: ['routine_exercises.exercise'],
      },
    ]);

    if (!error) {
      currentUser.routines = data;

      return this.localDatabase.put(currentUser);
    }

    return null;
  }

  async syncRoutineIntents() {
    const currentUser = await this.getCurrentUser();
    const apiClient = await this.getApiClient();

    for (const routineIntent in currentUser.routineIntents) {
      await apiClient.mutate(['routineIntents'], routineIntent);
    }
  }

  async sync() {
    await this.syncRoutineIntents();
    return await this.syncRoutines();
  }
}
