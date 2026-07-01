import { ServiceCategory } from './service-category.model';
import { WorkType } from './work-type.model';

export interface MasterDataPayload {
  categories?: ServiceCategory[];
  workTypes?: WorkType[];
  teams?: unknown[];
}
