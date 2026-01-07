export type CommandResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };
