export default class ExerciseDecorator {
  constructor(exercise, repetitions) {
    this.id = exercise.id;
    this.exercise_type = exercise.exercise_type;
    this.name = exercise.name;
    this.description = exercise.description;
    this.repetitions = repetitions;

    this.created_at = exercise.created_at;

    this.steps = JSON.parse(exercise.steps)
  }
}