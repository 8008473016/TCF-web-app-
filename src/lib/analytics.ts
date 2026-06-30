import fs from 'fs/promises';
import { config as appConfig } from './config';
import { dataPaths } from './dataPaths';

const config = {
  ...appConfig,
  dataPaths
};

interface AnalyticsData {
  visits: { path: string; timestamp: string }[];
  productViews: { [slug: string]: { name: string; views: number } };
  ctaClicks?: { [ctaType: string]: number };
}

const getAnalyticsFilePath = () => config.dataPaths.analytics;

async function readAnalytics(): Promise<AnalyticsData> {
  const filePath = getAnalyticsFilePath();
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      const defaultData: AnalyticsData = { visits: [], productViews: {}, ctaClicks: { call: 0, whatsapp: 0, quote: 0 } };
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    console.error('Error reading analytics file, returning empty default:', err);
    return { visits: [], productViews: {}, ctaClicks: { call: 0, whatsapp: 0, quote: 0 } };
  }
}

async function writeAnalytics(data: AnalyticsData): Promise<void> {
  const filePath = getAnalyticsFilePath();
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing analytics file:', error);
  }
}

export const analyticsService = {
  recordVisit: async (path: string): Promise<void> => {
    if (path.startsWith('/api') || path.startsWith('/uploads') || path.startsWith('/_next') || path.includes('.')) return;
    
    const data = await readAnalytics();
    
    data.visits.push({
      path,
      timestamp: new Date().toISOString()
    });

    if (data.visits.length > 5000) {
      data.visits = data.visits.slice(-5000);
    }

    await writeAnalytics(data);
  },

  recordProductView: async (slug: string, name: string): Promise<void> => {
    if (!slug) return;
    const data = await readAnalytics();

    if (!data.productViews) {
      data.productViews = {};
    }

    if (data.productViews[slug]) {
      data.productViews[slug].views = (data.productViews[slug].views || 0) + 1;
      if (name) {
        data.productViews[slug].name = name;
      }
    } else {
      data.productViews[slug] = {
        name: name || slug,
        views: 1
      };
    }

    await writeAnalytics(data);
  },

  recordCtaClick: async (ctaType: string): Promise<void> => {
    if (!ctaType) return;
    const data = await readAnalytics();

    if (!data.ctaClicks) {
      data.ctaClicks = { call: 0, whatsapp: 0, quote: 0 };
    }

    data.ctaClicks[ctaType] = (data.ctaClicks[ctaType] || 0) + 1;
    await writeAnalytics(data);
  },

  getStats: async (): Promise<any> => {
    const data = await readAnalytics();

    const totalVisits = data.visits.length;

    const pathCounts: { [path: string]: number } = {};
    data.visits.forEach(v => {
      pathCounts[v.path] = (pathCounts[v.path] || 0) + 1;
    });

    const visitsByPath = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    const topProducts = Object.entries(data.productViews || {})
      .map(([slug, info]) => ({
        slug,
        name: info.name,
        views: info.views
      }))
      .sort((a, b) => b.views - a.views);

    const dailyVisits: { [date: string]: number } = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      dailyVisits[dateString] = 0;
    }

    data.visits.forEach(v => {
      const dateString = v.timestamp.split('T')[0];
      if (dailyVisits[dateString] !== undefined) {
        dailyVisits[dateString]++;
      }
    });

    const dailyVisitList = Object.entries(dailyVisits).map(([date, count]) => ({
      date,
      count
    }));

    return {
      totalVisits,
      visitsByPath,
      topProducts,
      dailyVisits: dailyVisitList,
      ctaClicks: data.ctaClicks || { call: 0, whatsapp: 0, quote: 0 }
    };
  }
};
