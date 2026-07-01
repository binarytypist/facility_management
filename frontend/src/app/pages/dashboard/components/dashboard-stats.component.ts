import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './dashboard-stats.component.html'
})
export class DashboardStatsComponent {
  kpiStats = input.required<any>();

  scheduledPercentage = computed(() => {
    const stats = this.kpiStats();
    if (!stats || stats.total === 0) return 0;
    const sched = stats.scheduleDistribution?.find((s: any) => s.schedule_type === 'scheduled');
    return sched ? Math.round((sched.count / stats.total) * 100) : 0;
  });
}
