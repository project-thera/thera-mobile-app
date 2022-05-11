import PouchDB from 'pouchdb-core';
PouchDB.plugin(require('pouchdb-adapter-asyncstorage').default);

import {ApiClient} from 'jsonapi-react-native';
import schema from '../models/schema';

import {API_URL} from '../../config/config';

import {
  pushReminderNotification,
  removeAllNotifications,
} from '../notifications';

const LOCAL_USER_KEY = 'current';
const LOCAL_DATABASE_NAME = 'thera';

export const ROUTINE_INTENT_EXERCISE_COMPLETED = 1;
export const ROUTINE_INTENT_EXERCISE_SKIPPED = 0;

const BASE_64_VIDEO_PREFIX = 'data:video/mp4;base64,';

export default class Database {
  static instance = null;
  static apiClient = null;
  static gameReward = null;

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
    });

    return Database.apiClient;
  }

  async getCurrentUser() {
    return await this.localDatabase.get(LOCAL_USER_KEY);
  }

  async setCurrentUser(user) {
    try {
      await this.removeCurrentUser();
    } catch {
      // Do nothing, no user was found to remove
    }

    const currentUser = {...user, routineIntents: [], _id: LOCAL_USER_KEY};

    return await this.localDatabase.put(currentUser);
  }

  async removeCurrentUser() {
    this.apiClient = null;
    const currentUser = await this.localDatabase.get(LOCAL_USER_KEY);

    return await this.localDatabase.remove(currentUser);
  }

  async getRoutines() {
    const currentUser = await this.getCurrentUser();
    
    // sort by created_at desc
    let routines = await currentUser.routines?.sort((a, b) =>
      a.created_at > b.created_at ? -1 : 1,
    ) || [];

    return routines;
  }

  getRoutineIntent(routine) {
    return {
      routine_id: routine.id,
      started_at: new Date().toISOString(), // TODO check this
      finished_at: null,
      routine_intent_exercises_attributes: [],
    };
  }

  getLastRoutineIntentForRoutine = async (routine) => {
    const currentUser = await this.getCurrentUser();

    let routineIntents = currentUser.routineIntents.filter(
      (routineIntent) => routineIntent.routine_id == routine.id,
    );

    routineIntents.sort((a, b) => (a.started_at > b.started_at ? -1 : 1));

    return routineIntents.length > 0 ? routineIntents[0] : null;
  };

  async addRoutineIntent(routineIntent) {
    const currentUser = await this.getCurrentUser();

    currentUser.routineIntents.push(routineIntent);

    return await this.localDatabase.put(currentUser);
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

      return await this.localDatabase.put(currentUser);
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

    return await this.localDatabase.put(currentUser);
  }

  async getGameReward() {
    const currentUser = await this.getCurrentUser();
    const apiClient = await this.getApiClient();

    if (currentUser.gameReward) {
      return currentUser.gameReward;
    }

    const {data, errors} = await apiClient.fetch([
      'users',
      currentUser.data.id,
      {
        include: ['game_reward'],
      },
    ]);

    currentUser.gameReward = data.game_reward;

    await this.localDatabase.put(currentUser);

    return currentUser.gameReward;
  }

  async updateGameReward(gameReward) {
    const currentUser = await this.getCurrentUser();

    currentUser.gameReward = gameReward;

    return await this.localDatabase.put(currentUser);
  }

  async syncGameRewards() {
    const apiClient = await this.getApiClient();
    const gameReward = await this.getGameReward();

    return apiClient.mutate(['game_rewards', gameReward.id], gameReward);
  }

  async sync() {
    const currentUser = await this.getCurrentUser();

    // output to generate schema.json
    // console.log("SYNC");
    // console.log(currentUser);
    // console.log("ROUTINE INTENTS");
    // console.log(currentUser.routineIntents[0].routine_intent_exercises_attributes);
    // console.log("ROUTINE EXERCISES");
    // console.log(currentUser.routines[0].routine_exercises)

    await this.syncRoutineIntents();
    await this.syncGameRewards();

    return this.syncRoutines();
  }

  async addPatientVideo(base64video) {
    const apiClient = await this.getApiClient();

    return apiClient.mutate(['patient_videos'], {
      video: `${BASE_64_VIDEO_PREFIX}${base64video}`,
    });
  }

  getBlowConfig = async () => {
    let currentUser = await this.getCurrentUser();

    if (currentUser.blowConfig == null) {
      currentUser.blowConfig = { sampleRate: 12 }

      await this.updateBlowConfig(currentUser.blowConfig)
    }

    return currentUser.blowConfig;
  };

  updateBlowConfig = async (blowConfig) => {
    const currentUser = await this.getCurrentUser();

    currentUser.blowConfig = blowConfig;

    return await this.localDatabase.put(currentUser);
  };

  getCameraResolution = async () => {
    const currentUser = await this.getCurrentUser();

    if (currentUser.cameraResolution == null) {
      currentUser.cameraResolution = {
        height: 1080,
        width: 1920,
      }

      await this.updateCameraResolution(currentUser.cameraResolution)
    }

    return currentUser.cameraResolution;
  };

  updateCameraResolution = async (cameraResolution) => {
    const currentUser = await this.getCurrentUser();

    currentUser.cameraResolution = cameraResolution;

    return await this.localDatabase.put(currentUser);
  };

  async getReminder() {
    const currentUser = await this.getCurrentUser();

    return currentUser.reminderTime ? new Date(currentUser.reminderTime) : null;
  }

  async updateReminder(reminderTime) {
    const currentUser = await this.getCurrentUser();

    removeAllNotifications();

    currentUser.reminderTime = reminderTime;

    pushReminderNotification(
      '¿Tienes un rato para realizar las rutinas diarias?',
      reminderTime,
    );

    return await this.localDatabase.put(currentUser);
  }

  async removeReminder() {
    const currentUser = await this.getCurrentUser();

    currentUser.reminderTime = null;

    removeAllNotifications();

    return await this.localDatabase.put(currentUser);
  }

  async testAddRoutineIntent() {
    await this.syncRoutines();

    const currentUser = await this.getCurrentUser();
    const routine = currentUser.routines[0];

    const routineIntent = this.getRoutineIntent(routine);
    const routineExercise = routine.routine_exercises[0];

    routineIntent.routine_intent_exercises_attributes.push({
      exercise_id: routineExercise.exercise_id,
      status: ROUTINE_INTENT_EXERCISE_COMPLETED,
    });

    await this.addRoutineIntent(routineIntent);

    return this.syncRoutineIntents();
  }

  async testGameReward() {
    const gameReward = await this.getGameReward();

    gameReward.credits = 10;

    await this.updateGameReward(gameReward);
    await this.syncGameRewards();
  }

  async testPatientVideos() {
    const apiClient = await this.getApiClient();

    await apiClient.mutate(['patient_videos'], {
      video: 'data:video/mp4;base64,hola',
    });
  }
}
