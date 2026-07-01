export interface KpiStats {
  total: number;
  active: number;
  completed: number;
  closed: number;
  totalCost: number;
  priorityDistribution: Array<{ priority: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  scheduleDistribution: Array<{ schedule_type: string; count: number }>;
  costByCategory: Array<{ category: string; category_name?: string; total_cost: number; count?: number }>;
  costBySite: Array<{ site: string; site_name?: string; total_cost: number; count?: number }>;
}

export interface WorkEvent {
  id?: string;
  title?: string;
  description?: string;
  client_id?: string;
  scheduled_date?: string | Date;
  status?: string;
  [key: string]: unknown;
}
