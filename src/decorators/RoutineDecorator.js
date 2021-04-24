import ExerciseDecorator from './ExerciseDecorator';

export default class RoutineDecorator {
  constructor(routine) {
    this.id = routine.id;
    this.daily_limit = routine.daily_limit;
    this.discarded = routine.discarded;

    this.created_at = routine.created_at;

    this.exercises = [];

    routine.routine_exercises.forEach((re) => {
      this.exercises.push(new ExerciseDecorator(re.exercise, re.repetitions));
    });
  }
}
