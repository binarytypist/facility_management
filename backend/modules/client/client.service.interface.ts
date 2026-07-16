export interface IClientService {
  /**
   * Get all clients.
   */
  getAllClients(): Promise<any[]>;

  /**
   * Create a new client.
   */
  createClient(data: any): Promise<any>;
}
