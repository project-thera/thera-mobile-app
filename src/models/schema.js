export default {
  routines: {
    type: 'routines',
    relationships: {
      routineExercises: {
        type: 'routine_exercises',
        relationships: {
          exercises: {
            type: 'exercises',
          },
        },
      },
    },
  },
  routineIntents: {
    type: 'routine_intents',
    relationships: {
      routineIntentExercises: {
        type: 'routines_intent_exercises',
      },
    },
  },
  user: {
    type: 'users',
    relationships: {
      gameReward: {
        type: 'game_rewards',
      },
    },
  },
  gameRewards: {
    type: 'game_rewards',
  },
};
