export interface ISeeder {
  seed(): Promise<void>;
  deleteAll(): Promise<void>;
}
