export interface IClientRepository {
  /**
   * Fetch all clients with related company type, facility, and employee counts.
   */
  findAll(): Promise<any[]>;

  /**
   * Create a new client.
   */
  create(data: any): Promise<any>;
}
