export default {
  routines: {
    type: 'routines',
    relationships: {
      routine_exercises: {
        type: 'routine_exercises',
        relationships: {
          exercises: {
            type: 'exercises',
          },
        },
      },
    },
  },
  routine_intents: {
    type: 'routine_intents',
    relationships: {
      routine_intent_exercises: {
        type: 'routines_intent_exercises',
      },
    },
  },
  user: {
    type: 'users',
    relationships: {
      game_reward: {
        type: 'game_rewards',
      },
    },
  },
  patient_videos: {
    type: 'patient_videos',
  },
  game_rewards: {
    type: 'game_rewards',
  },
};
