export class AuthField {
  value: string;
  error: string | null;

  constructor(value: string = "", error: string | null = null) {
    this.value = value;
    this.error = error;
  }
}
