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
      // Normalize common DB format "YYYY-MM-DD HH:mm:ss"
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
  
  // Static pages with their priorities and change frequencies
  const staticPages = [
    {
      url: '',
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: '/about',
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: '/machines',
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: '/tools',
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: '/news',
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7
    },
    {
      url: '/forums',
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.6
    }
  ];

  // Fetch machines dynamically for inclusion
  let machines = machinesData as any[];
  try {
    const machinesDB = new HTBMachinesDB();
    const dbMachines = await machinesDB.getAllMachines();
    if (dbMachines && dbMachines.length > 0) {
      machines = dbMachines as any[];
    }
  } catch (e) {
    // fallback to static
  }

  const machineUrls = machines
    .map((machine: any) => {
      const lastModified = toW3CDate(machine.updated_at || machine.created_at || machine.dateCompleted || currentDate);
      const changeFreq = machine.status === 'Completed' ? 'monthly' : 'weekly';
      const priority = machine.status === 'Completed' ? '0.9' : '0.7';
      // Use nested HTB path
      const loc = `${baseUrl}/machines/htb/${machine.id}`;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
${machineUrls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
    },
  });
}
