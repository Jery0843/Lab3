import { NextResponse } from 'next/server';
import { HTBMachinesDB } from '@/lib/db';
import machinesData from '@/data/machines.json';

export async function GET(request: Request) {
  // Auto-detect the base URL from the request
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const currentDate = new Date().toISOString();
  const toW3CDate = (value: any): string => {
    if (!value) return currentDate;
    try {
      const str = String(value).trim();
      const normalized = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(str)
        ? str.replace(' ', 'T') + 'Z'
        : str;
      const d = new Date(normalized);
      return isNaN(d.getTime()) ? currentDate : d.toISOString();
    } catch {
      return currentDate;
    }
  };

  try {
    // Fetch machines from database, fallback to static data
    let machines = machinesData;
    
    try {
      const machinesDB = new HTBMachinesDB();
      const dbMachines = await machinesDB.getAllMachines();
      if (dbMachines && dbMachines.length > 0) {
        machines = dbMachines;
      }
    } catch (error) {
      console.warn('Using static data for sitemap generation:', error);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Main machines page -->
  <url>
    <loc>${baseUrl}/machines</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${machines
  .map((machine) => {
    const lastModified = toW3CDate((machine as any).updated_at || (machine as any).created_at || machine.dateCompleted || currentDate);
    const priority = machine.status === 'Completed' ? '0.9' : '0.7';
    const changeFreq = machine.status === 'Completed' ? 'monthly' : 'weekly';
    
    return `  <url>
    <loc>${baseUrl}/machines/${machine.id}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating machines sitemap:', error);
    
    // Fallback sitemap with basic machines page and static data
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/machines</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${machinesData
  .map((machine) => `  <url>
    <loc>${baseUrl}/machines/${machine.id}</loc>
    <lastmod>${machine.dateCompleted || currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`)
  .join('\n')}
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
      },
    });
  }
}
