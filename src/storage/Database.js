import PouchDB from 'pouchdb-core';
PouchDB.plugin(require('pouchdb-adapter-asyncstorage').default);

import {ApiClient} from 'jsonapi-react-native';
import schema from '../models/schema';

import {API_URL} from '../../config/config';

const LOCAL_USER_KEY = 'current';
const LOCAL_DATABASE_NAME = 'thera';

export const ROUTINE_INTENT_EXERCISE_COMPLETED = 1;
export const ROUTINE_INTENT_EXERCISE_SKIPPED = 0;

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

  getCurrentUser() {
    return this.localDatabase.get(LOCAL_USER_KEY);
  }

  async setCurrentUser(user) {
    try {
      await this.removeCurrentUser();
    } catch {
      // Do nothing, no user was found to remove
    }

    const currentUser = {...user, routineIntents: [], _id: LOCAL_USER_KEY};

    return this.localDatabase.put(currentUser);
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
      // fetchOptions: {
      //   credentials: 'include',
      // },
    });

    return Database.apiClient;
  }

  async getRoutines() {
    const currentUser = await this.getCurrentUser();

    return currentUser.routines;
  }

  getRoutineIntent(routine) {
    return {
      routine_id: routine.id,
      started_at: new Date().toISOString(), // TODO check this
      finished_at: null,
      routine_intent_exercises_attributes: [],
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

    for (const routineIntent of currentUser.routineIntents) {
      await apiClient.mutate(['routine_intents'], routineIntent);
    }

    // TODO handle errors
    currentUser.routineIntents = [];

    return this.localDatabase.put(currentUser);
  }

  async sync() {
    await this.syncRoutineIntents();

    return this.syncRoutines();
  }

  async testAddRoutineIntent() {
    await this.syncRoutines();

    const currentUser = await this.getCurrentUser();
    const routine = currentUser.routines[0];

    // console.log('routine');
    // console.log(routine);

    const routineIntent = this.getRoutineIntent(routine);
    const routineExercise = routine.routine_exercises[0];

    // console.log('routineIntent');
    // console.log(routineIntent);

    routineIntent.routine_intent_exercises_attributes.push({
      exercise_id: routineExercise.exercise_id,
      status: ROUTINE_INTENT_EXERCISE_COMPLETED,
    });

    // console.log('routineIntent2');
    // console.log(routineIntent);

    await this.addRoutineIntent(routineIntent);

    return this.syncRoutineIntents();
  }
}
