import { Hono } from 'hono'
import { zipSync } from 'fflate'
import { requirePermission, requireSession } from './middleware.ts'
import { convertDrizzleToCSV, Permission } from '@HexScout/shared'
import type { AppVariables } from '../types/hono.ts'
import { users, scoutforms, scoutforms_hist, robotPhotos } from '../db/schema.ts'
import db from '../db/database.ts'

const dbRoutes = new Hono<{
  Variables: AppVariables
}>()

dbRoutes.get("/clear/scout", requireSession, requirePermission(Permission.ScoutingClearDB) , async (c) => {
  await db.delete(scoutforms);
  await db.delete(scoutforms_hist);
  return c.json({ success: true })
})

dbRoutes.get("/clear/users", requireSession, requirePermission(Permission.UsersClearDB) , async (c) => {
  await db.delete(users);
  return c.json({ success: true })
})

dbRoutes.get("/clear/images", requireSession, requirePermission(Permission.ImagesClearDB) , async (c) => {
  await db.delete(robotPhotos);
  return c.json({ success: true })
})


dbRoutes.get("/export/scout", requireSession, requirePermission(Permission.ScoutingExport) , async (c) => {
  try {
    const [scoutTable, scoutHistoryTable] = await Promise.all([
      db.select().from(scoutforms),
      db.select().from(scoutforms_hist),
    ])

    const scoutCsv = "\uFEFF" + convertDrizzleToCSV(scoutTable)
    const scoutHistoryCsv = "\uFEFF" + convertDrizzleToCSV(scoutHistoryTable)
    const archive = zipSync({
      'scoutforms.csv': new TextEncoder().encode(scoutCsv),
      'scoutforms_hist.csv': new TextEncoder().encode(scoutHistoryCsv),
    })
    const archiveData = new Uint8Array(new ArrayBuffer(archive.byteLength))
    archiveData.set(archive)

    return c.body(archiveData, 200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="scout_export.zip"',
      'X-Content-Type-Options': 'nosniff',
    })

  } catch (error) {
    console.error('CSV Export Failed:', error);
    return c.json({ error: 'Failed to generate CSV export' }, 500);
  }
});


dbRoutes.get("/export/users", requireSession, requirePermission(Permission.UsersExport) , async (c) => {
  try {
    const usersTable = await db.select().from(users);

    const csvString = convertDrizzleToCSV(usersTable);

    const BOM = "\uFEFF";
    const finalCsvContent = BOM + csvString;

    return c.text(finalCsvContent, 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      
      'Content-Disposition': 'attachment; filename="users_export.csv"',
      
      'X-Content-Type-Options': 'nosniff',
    });

  } catch (error) {
    console.error('CSV Export Failed:', error);
    return c.json({ error: 'Failed to generate CSV export' }, 500);
  }
})

dbRoutes.get("/export/images", requireSession, requirePermission(Permission.ImagesExport) , async (c) => {
    try {
    const imageTable = await db.select().from(robotPhotos);

    const csvString = convertDrizzleToCSV(imageTable);

    const BOM = "\uFEFF";
    const finalCsvContent = BOM + csvString;

    return c.text(finalCsvContent, 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      
      'Content-Disposition': 'attachment; filename="images_export.csv"',
      
      'X-Content-Type-Options': 'nosniff',
    });

  } catch (error) {
    console.error('CSV Export Failed:', error);
    return c.json({ error: 'Failed to generate CSV export' }, 500);
  }
})

export default dbRoutes