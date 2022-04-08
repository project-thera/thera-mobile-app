class ExerciseHelper {
  static asRoutine = (exercise) => {
    let now = new Date();

    return {
      created_at: now.toString(),
      daily_limit: 1,
      discarded: false,
      id: 20210427,
      patiend_id: 20210427,
      routine_exercises: [
        {
          created_at: now.toString(),
          exercise: exercise,
          exercise_id: exercise.id,
          id: 20210427,
          repetitions: 1,
          routine_id: 20210427,
          updated_at: now.toString(),
        },
      ],
      supervisor_id: 20210427,
      updated_at: now.toString(),
    };
  };
}

export default ExerciseHelper;

// {"created_at": "2021-04-23T02:33:49.253-03:00", "daily_limit": 1, "discarded": false, "id": "250", "patient_id": "82", "routine_exercises": [{"created_at": "2021-04-23T02:33:49.257-03:00", "exercise": [Object], "exercise_id": 27, "id": "1930", "repetitions": 1, "routine_id": 250, "updated_at": "2021-04-23T02:33:49.257-03:00"}], "routine_exercises_attributes": [{"created_at": "2021-04-23T02:33:49.257-03:00", "exercise_id": 27, "id": 1930, "repetitions": 1, "routine_id": 250, "updated_at": "2021-04-23T02:33:49.257-03:00"}], "supervisor_id": "63", "updated_at": "2021-04-23T02:33:49.253-03:00"}
