import { corsHeaders } from '@/lib/cors';
import { NextResponse } from 'next/server';
import { pool, initDB } from '@/lib/db';

let isDbInitialized = false;



export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function GET(request: Request) {
  try {
    if (!isDbInitialized) {
      await initDB();
      isDbInitialized = true;
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('location_id');

    let descendantIds: number[] = [];
    if (locationId) {
      const locIdNum = parseInt(locationId, 10);
      if (!isNaN(locIdNum)) {
        const [allLocs] = await pool.query('SELECT id, parent_id FROM locations') as any[];
        descendantIds.push(locIdNum);
        
        const getChildren = (id: number) => {
          allLocs.forEach((loc: any) => {
            if (loc.parent_id === id) {
              descendantIds.push(loc.id);
              getChildren(loc.id);
            }
          });
        };
        
        getChildren(locIdNum);
      }
    }

    const locationFilterSql = descendantIds.length > 0 
      ? `AND we.location_id IN (${descendantIds.join(',')})` 
      : '';

    // 1. Basic counts
    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN we.status IN ('created', 'assigned', 'in_progress') THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN we.status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN we.status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM work_events we
      WHERE 1=1 ${locationFilterSql}
    `) as any[];

    // 2. Total cost
    const [costRows] = await pool.query(`
      SELECT SUM(wr.cost) as totalCost
      FROM work_results wr
      JOIN work_events we ON wr.work_event_id = we.id
      WHERE 1=1 ${locationFilterSql}
    `) as any[];

    // 3. Priority distribution
    const [priorityRows] = await pool.query(`
      SELECT we.priority, COUNT(*) as count
      FROM work_events we
      WHERE 1=1 ${locationFilterSql}
      GROUP BY we.priority
    `) as any[];

    // 4. Status distribution
    const [statusRows] = await pool.query(`
      SELECT we.status, COUNT(*) as count
      FROM work_events we
      WHERE 1=1 ${locationFilterSql}
      GROUP BY we.status
    `) as any[];

    // 5. Schedule type distribution (Scheduled vs Unscheduled)
    const [scheduleRows] = await pool.query(`
      SELECT we.schedule_type, COUNT(*) as count
      FROM work_events we
      WHERE 1=1 ${locationFilterSql}
      GROUP BY we.schedule_type
    `) as any[];

    // 6. Cost breakdown by Category
    const [categoryRows] = await pool.query(`
      SELECT 
        wt.name as category_name, 
        wt.code as category_code,
        SUM(wr.cost) as total_cost, 
        COUNT(we.id) as count
      FROM work_events we
      JOIN work_types wt ON we.work_type_id = wt.id
      JOIN work_results wr ON we.id = wr.work_event_id
      WHERE 1=1 ${locationFilterSql}
      GROUP BY wt.id
      ORDER BY total_cost DESC
    `) as any[];

    // 7. Rolled-up costs by Site level
    const [allResults] = await pool.query(`
      SELECT wr.cost, we.location_id 
      FROM work_results wr
      JOIN work_events we ON wr.work_event_id = we.id
      WHERE 1=1 ${locationFilterSql}
    `) as any[];

    const [locations] = await pool.query('SELECT id, name, parent_id, type FROM locations') as any[];
    const locMap = new Map<number, any>(locations.map((l: any) => [l.id, l]));
    
    const siteCostsMap: { [siteName: string]: { cost: number, count: number } } = {};
    
    allResults.forEach((res: any) => {
      let current = locMap.get(res.location_id);
      if (!current) return;
      
      // Traverse up to find the root site
      while (current && current.parent_id !== null) {
        current = locMap.get(current.parent_id);
      }
      
      if (current && current.type === 'site') {
        const siteName = current.name;
        if (!siteCostsMap[siteName]) {
          siteCostsMap[siteName] = { cost: 0, count: 0 };
        }
        siteCostsMap[siteName].cost += parseFloat(res.cost || 0);
        siteCostsMap[siteName].count += 1;
      }
    });

    const siteCosts = Object.keys(siteCostsMap).map(siteName => ({
      site_name: siteName,
      total_cost: siteCostsMap[siteName].cost,
      count: siteCostsMap[siteName].count
    })).sort((a, b) => b.total_cost - a.total_cost);

    return NextResponse.json(
      {
        success: true,
        stats: {
          total: counts[0].total || 0,
          active: counts[0].active || 0,
          completed: counts[0].completed || 0,
          closed: counts[0].closed || 0,
          totalCost: parseFloat(costRows[0].totalCost || 0),
          priorityDistribution: priorityRows,
          statusDistribution: statusRows,
          scheduleDistribution: scheduleRows,
          costByCategory: categoryRows.map((r: any) => ({
            ...r,
            total_cost: parseFloat(r.total_cost || 0)
          })),
          costBySite: siteCosts
        }
      },
      {
        status: 200,
        headers: corsHeaders(),
      }
    );
  } catch (error: any) {
    console.error('Error calculating dashboard stats:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

