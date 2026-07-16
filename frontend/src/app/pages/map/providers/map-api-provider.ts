import { Observable } from 'rxjs';
import { Client } from '../../../models/client.model';
import { Agency } from '../../../models/agency.model';

export abstract class MapApiProvider {
  /**
   * Retrieves a list of clients.
   */
  abstract getClients(): Observable<{ clients: Client[] } | Client[]>;

  /**
   * Retrieves a list of agencies.
   */
  abstract getAgencies(): Observable<Agency[]>;
}
