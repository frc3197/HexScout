import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { Permission } from '@HexScout/shared'
import type { RobotPhoto } from '@HexScout/shared'
import type { AppVariables } from '../types/hono.ts'
import { requirePermission, requireSession } from './middleware.ts'
import db from '../db/database.ts'
import { robotPhotos } from '../db/schema.ts'

const imageRoutes = new Hono<{
  Variables: AppVariables
}>()

const maxImageSize = 10 * 1024 * 1024

imageRoutes.post('/', requireSession, requirePermission(Permission.ImagesUpload), async (c) => {
  const body = await c.req.parseBody()
  const image = body.image
  const teamNumber = Number(body.teamNumber)

  if (!(image instanceof File)) {
    return c.json({ error: 'An image file is required in the image field' }, 400)
  }

  if (image.type !== 'image/jpeg') {
    return c.json({ error: 'Only JPEG images are supported' }, 415)
  }

  if (!Number.isInteger(teamNumber) || teamNumber <= 0) {
    return c.json({ error: 'A positive integer teamNumber is required' }, 400)
  }

  if (image.size > maxImageSize) {
    return c.json({ error: 'Image must be 10 MB or smaller' }, 413)
  }

  const session = c.get('session')
  const [photo] = await db.insert(robotPhotos).values({
    teamNumber,
    mimeType: image.type,
    data: Buffer.from(await image.arrayBuffer()),
    uploaderUuid: session.userId,
  }).returning({
    uuid: robotPhotos.uuid,
    teamNumber: robotPhotos.teamNumber,
    mimeType: robotPhotos.mimeType,
    createdAt: robotPhotos.createdAt,
    uploaderUuid: robotPhotos.uploaderUuid,
  })

  return c.json({
    image: {
      id: photo.uuid,
      teamNumber: photo.teamNumber,
      mimeType: photo.mimeType,
      createdAt: photo.createdAt,
      uploaderUuid: photo.uploaderUuid,
    },
  }, 201)
})

imageRoutes.get('/', requireSession, async (c) => {
  const teamNumberValue = c.req.query('teamNumber')
  const teamNumber = teamNumberValue === undefined ? undefined : Number(teamNumberValue)
  const photos = await db.select({
    id: robotPhotos.uuid,
    teamNumber: robotPhotos.teamNumber,
    mimeType: robotPhotos.mimeType,
    createdAt: robotPhotos.createdAt,
    uploaderUuid: robotPhotos.uploaderUuid,
  }).from(robotPhotos).where(
    teamNumber === undefined ? undefined : eq(robotPhotos.teamNumber, teamNumber),
  )

  return c.json({ images: photos })
})

imageRoutes.get('/:id', requireSession, async (c) => {
  const photo = await db.query.robotPhotos.findFirst({
    where: {
      uuid: c.req.param('id'),
    },
  })

  if (!photo) {
    return c.json({ error: 'Image not found' }, 404)
  }

  const imageData = new Uint8Array(new ArrayBuffer(photo.data.length))
  imageData.set(photo.data)

  const image: RobotPhoto = {
    id: photo.uuid,
    teamNumber: photo.teamNumber,
    mimeType: 'image/jpeg',
    data: imageData,
    createdAt: photo.createdAt,
    uploaderUuid: photo.uploaderUuid,
  }

  return c.body(imageData, 200, {
    'Content-Type': image.mimeType,
    'Content-Length': imageData.byteLength.toString(),
    'Cache-Control': 'private, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  })
})

imageRoutes.delete('/:id', requireSession, requirePermission(Permission.ImagesDelete), async (c) => {
  const deleted = await db.delete(robotPhotos)
    .where(eq(robotPhotos.uuid, c.req.param('id')))
    .returning({ uuid: robotPhotos.uuid })

  if (deleted.length === 0) {
    return c.json({ error: 'Image not found' }, 404)
  }

  return c.json({ success: true })
})

export default imageRoutes