export interface LocationNode {
  id: number;
  name: string;
  type: string;
  parent_id: number | null;
  children: LocationNode[];
  taskCount?: number;
}

export interface CalendarDay {
  date: Date;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: any[];
}
