import { Hono } from 'hono'
import { and, desc, eq } from 'drizzle-orm'
import { Permission } from '@HexScout/shared'
import type { ScoutData } from '@HexScout/shared'
import type { AppVariables } from '../types/hono.ts'
import { requirePermission, requireSession } from './middleware.ts'
import db from '../db/database.ts'
import { scoutforms, scoutforms_hist } from '../db/schema.ts'

const scoutRoutes = new Hono<{
  Variables: AppVariables
}>()

type ScoutFormInput = {
  uuid?: string
  submittingScouterUuid?: string
  eventCode?: string
  matchNumber?: number
  teamNumber?: number
  formVersion?: string
  data?: ScoutData
}

function isScoutData(value: unknown): value is ScoutData {
  if (!value || typeof value !== 'object') {
    return false
  }

  const formType = (value as { formType?: unknown }).formType
  return formType === 'match' || formType === 'pit'
}

function validateFormInput(input: ScoutFormInput): string | undefined {
  if (!input.eventCode || typeof input.eventCode !== 'string') {
    return 'eventCode is required'
  }

  if (typeof input.matchNumber !== 'number' || !Number.isInteger(input.matchNumber) || input.matchNumber < 0) {
    return 'matchNumber must be a non-negative integer'
  }

  if (typeof input.teamNumber !== 'number' || !Number.isInteger(input.teamNumber) || input.teamNumber <= 0) {
    return 'teamNumber must be a positive integer'
  }

  if (!input.formVersion || typeof input.formVersion !== 'string') {
    return 'formVersion is required'
  }

  if (!isScoutData(input.data)) {
    return 'data.formType must be match or pit'
  }
}

scoutRoutes.post('/', requireSession, requirePermission(Permission.ScoutingUpload), async (c) => {
  const payload = await c.req.json<ScoutFormInput | { forms: ScoutFormInput[] } | ScoutFormInput[]>()
  const forms = Array.isArray(payload) ? payload : 'forms' in payload ? payload.forms : [payload]
  const validationError = forms.find((form) => validateFormInput(form))

  if (validationError) {
    return c.json({ error: validateFormInput(validationError) }, 400)
  }

  const session = c.get('session')
  const insertedForms = await db.insert(scoutforms).values(forms.map((form) => ({
    ...(form.uuid ? { uuid: form.uuid } : {}),
    submittingScouterUuid: form.submittingScouterUuid ?? session.userId,
    eventCode: form.eventCode!,
    matchNumber: form.matchNumber!,
    teamNumber: form.teamNumber!,
    formVersion: form.formVersion!,
    data: form.data!,
  }))).returning()

  return c.json({ forms: insertedForms }, 201)
})

scoutRoutes.get('/', requireSession, async (c) => {
  const eventCode = c.req.query('eventCode')
  const teamNumberValue = c.req.query('teamNumber')
  const teamNumber = teamNumberValue === undefined ? undefined : Number(teamNumberValue)
  const filters = []

  if (eventCode) {
    filters.push(eq(scoutforms.eventCode, eventCode))
  }

  if (teamNumber !== undefined && Number.isInteger(teamNumber)) {
    filters.push(eq(scoutforms.teamNumber, teamNumber))
  }

  const forms = await db.select().from(scoutforms).where(filters.length > 0 ? and(...filters) : undefined)
  return c.json({ forms })
})

scoutRoutes.get('/:uuid', requireSession, async (c) => {
  const uuid = c.req.param('uuid')
  const [form] = await db.select().from(scoutforms).where(eq(scoutforms.uuid, uuid))

  if (!form) {
    return c.json({ error: 'Scout form not found' }, 404)
  }

  const history = await db.select().from(scoutforms_hist)
    .where(eq(scoutforms_hist.scoutFormUuid, uuid))

  return c.json({ form: { ...form, history } })
})

scoutRoutes.patch('/:uuid', requireSession, requirePermission(Permission.ScoutingEditSubmitted), async (c) => {
  const uuid = c.req.param('uuid')
  const input = await c.req.json<Partial<ScoutFormInput>>()
  const [existingForm] = await db.select().from(scoutforms).where(eq(scoutforms.uuid, uuid))

  if (!existingForm) {
    return c.json({ error: 'Scout form not found' }, 404)
  }

  const nextData = input.data ?? existingForm.data
  if (!isScoutData(nextData)) {
    return c.json({ error: 'data.formType must be match or pit' }, 400)
  }

  const [lastRevision] = await db.select({ revision: scoutforms_hist.revision })
    .from(scoutforms_hist)
    .where(eq(scoutforms_hist.scoutFormUuid, uuid))
    .orderBy(desc(scoutforms_hist.revision))
    .limit(1)
  const revision = (lastRevision?.revision ?? 0) + 1
  const session = c.get('session')

  db.transaction((transaction) => {
    transaction.insert(scoutforms_hist).values({
      scoutFormUuid: uuid,
      revision,
      data: existingForm.data,
      modifiedBy: session.userId,
    })

    transaction.update(scoutforms).set({
      eventCode: input.eventCode ?? existingForm.eventCode,
      matchNumber: input.matchNumber ?? existingForm.matchNumber,
      teamNumber: input.teamNumber ?? existingForm.teamNumber,
      formVersion: input.formVersion ?? existingForm.formVersion,
      data: nextData,
    }).where(eq(scoutforms.uuid, uuid))
  })

  const [updatedForm] = await db.select().from(scoutforms).where(eq(scoutforms.uuid, uuid))
  return c.json({ form: updatedForm })
})

scoutRoutes.delete('/:uuid', requireSession, requirePermission(Permission.ScoutingDelete), async (c) => {
  const deleted = await db.delete(scoutforms)
    .where(eq(scoutforms.uuid, c.req.param('uuid')))
    .returning({ uuid: scoutforms.uuid })

  if (deleted.length === 0) {
    return c.json({ error: 'Scout form not found' }, 404)
  }

  return c.json({ success: true })
})

export default scoutRoutes