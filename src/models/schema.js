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
    type: 'routines_intents',
    relationships: {
      routineIntentExercises: {
        type: 'routines_Intent_exercises',
      },
    },
  },
};
