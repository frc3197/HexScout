# Backend Routes

Base URL: `http://localhost:3000`

All routes are mounted under `/api` in `src/app.ts`. Authenticated routes require the `session` cookie created by `POST /api/auth`.

## Quick Start

Open `http://localhost:3000/api` in Chrome, press `F12`, and use the Console.

### 1. Log In

Chrome stores the session cookie automatically:

```js
await fetch('/api/auth', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ name: 'admin', pin: 'your-admin-pin' })
}).then(response => response.json())
```

Check the current user:

```js
await fetch('/api/users/me').then(response => response.json())
```

### 2. Create a Scout Form

```js
await fetch('/api/scout', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		eventCode: '2026-event',
		matchNumber: 1,
		teamNumber: 3197,
		formVersion: '1.0.0',
		data: { formType: 'match' }
	})
}).then(response => response.json())
```

### 3. Upload a Robot Image

Select a JPEG file on the page first, then run:

```js
const form = new FormData()
form.append('teamNumber', '3197')
form.append('image', document.querySelector('input[type=file]').files[0])

await fetch('/api/image', {
	method: 'POST',
	body: form
}).then(response => response.json())
```

### 4. Download Scout Data

This downloads a ZIP containing `scoutforms.csv` and `scoutforms_hist.csv`:

```js
window.location.href = '/api/db/export/scout'
```

## General

| Method | Full path | Function | Use | Status codes and why |
|---|---|---|---|---|
| GET | `/api` | `app.get` | Basic backend greeting and connectivity check. | `200` request succeeds. |
| GET | `/api/status` | `statusRoutes.get` | Health check for the API and SQLite database. | `200` database responds to `SELECT 1`; `503` database check fails. |

## Authentication

| Method | Full path | Function | Use | Status codes and why |
|---|---|---|---|---|
| POST | `/api/auth` | `authRoutes.post` | Log in with `{ name, pin }`. Sets the `session` HTTP-only cookie and returns the public user. | `200` credentials are valid; `400` name or PIN is missing; `401` user is missing, inactive, or PIN is wrong; `500` user has no valid role or an unexpected database error occurs. |
| POST | `/api/auth/logout` | `authRoutes.post('/logout')` | Destroy the current session and clear the session cookie. | `200` logout completes, including when no session cookie exists. |

## Users

| Method | Full path | Function | Permission | Use | Status codes and why |
|---|---|---|---|---|---|
| GET | `/api/users/me` | `userRoutes.get('/me')` | Session | Return the currently logged-in user and role permissions. | `200` user is returned; `401` session is missing/invalid; `403` account is inactive; `404` session user does not exist; `500` user has no valid role. |
| GET | `/api/users` | `userRoutes.get` | `users.edit` | List users without exposing PIN hashes. | `200` users are returned; `401` session is missing/invalid; `403` permission is missing; `404` session user does not exist; `500` role data is invalid or database fails. |
| POST | `/api/users` | `userRoutes.post` | `users.add` | Create a user. Body: `{ name, pin, roleName? }`. Defaults to the `Scouter` role. | `201` user is created; `400` required data or role is invalid; `401` session is missing/invalid; `403` permission is missing; `404` session user does not exist; `409` name already exists; `500` role data or database operation fails. |
| PATCH | `/api/users/:uuid` | `userRoutes.patch` | `users.edit` | Update a user's `name`, `pin`, `roleName`, or `active` status. | `200` user is updated; `400` role is invalid; `401` session is missing/invalid; `403` permission is missing; `404` target or session user does not exist; `409` name already exists; `500` role data or database operation fails. |
| DELETE | `/api/users/:uuid` | `userRoutes.delete` | `users.delete` | Delete a user. A user cannot delete their own account. | `200` user is deleted; `400` user tries to delete themselves; `401` session is missing/invalid; `403` permission is missing; `404` target or session user does not exist; `500` database operation fails. |

## Scout Forms

| Method | Full path | Function | Permission | Use | Status codes and why |
|---|---|---|---|---|---|
| POST | `/api/scout` | `scoutRoutes.post` | `scouting.upload` | Create one form, an array of forms, or `{ forms: [...] }`. Requires event code, match number, team number, form version, and `data.formType` (`match` or `pit`). | `201` form(s) created; `400` required fields or `formType` are invalid; `401` session is missing/invalid; `403` permission is missing; `404` session user does not exist; `500` database operation fails. |
| GET | `/api/scout` | `scoutRoutes.get` | Session | List scout forms. Optional query filters: `eventCode` and `teamNumber`. | `200` forms are returned; `401` session is missing/invalid; `404` session user does not exist; `500` database operation fails. |
| GET | `/api/scout/:uuid` | `scoutRoutes.get('/:uuid')` | Session | Return one scout form and its history entries. | `200` form is returned; `401` session is missing/invalid; `404` form or session user does not exist; `500` database operation fails. |
| PATCH | `/api/scout/:uuid` | `scoutRoutes.patch('/:uuid')` | `scouting.editSubmitted` | Update a form and save its previous data as the next history revision. | `200` form is updated; `400` `data.formType` is invalid; `401` session is missing/invalid; `403` permission is missing; `404` form or session user does not exist; `500` database transaction fails. |
| DELETE | `/api/scout/:uuid` | `scoutRoutes.delete('/:uuid')` | `scouting.delete` | Delete a scout form. Its history is removed by the database cascade. | `200` form is deleted; `401` session is missing/invalid; `403` permission is missing; `404` form or session user does not exist; `500` database operation fails. |

## Images

Images use the shared `RobotPhoto` model and are stored as JPEG BLOBs in SQLite. Uploads are limited to 10 MB.

| Method | Full path | Function | Permission | Use | Status codes and why |
|---|---|---|---|---|---|
| POST | `/api/image` | `imageRoutes.post` | `images.upload` | Upload a JPEG using `multipart/form-data` fields `image` and `teamNumber`. | `201` image is stored; `400` file or team number is missing/invalid; `401` session is missing/invalid; `403` permission is missing; `404` session user does not exist; `413` image exceeds 10 MB; `415` file is not JPEG; `500` database operation fails. |
| GET | `/api/image` | `imageRoutes.get` | Session | List image metadata. Optional query filter: `teamNumber`. | `200` metadata is returned; `401` session is missing/invalid; `404` session user does not exist; `500` database operation fails. |
| GET | `/api/image/:id` | `imageRoutes.get('/:id')` | Session | Return the stored JPEG bytes for an image ID. | `200` image bytes are returned; `401` session is missing/invalid; `404` image or session user does not exist; `500` database operation fails. |
| DELETE | `/api/image/:id` | `imageRoutes.delete('/:id')` | `images.delete` | Delete an image by ID. | `200` image is deleted; `401` session is missing/invalid; `403` permission is missing; `404` image or session user does not exist; `500` database operation fails. |

## Database Administration

| Method | Full path | Function | Permission | Use | Status codes and why |
|---|---|---|---|---|---|
| GET | `/api/db/clear/scout` | `dbRoutes.get('/clear/scout')` | `scouting.clearDB` | Delete all scout forms and scout form history. | `200` deletion succeeds only if a response is added; currently the handler returns no response and may result in `404`; `401` session is missing/invalid; `403` permission is missing; `500` database operation fails. |
| GET | `/api/db/clear/users` | `dbRoutes.get('/clear/users')` | `users.clearDB` | Delete all users. | `200` deletion succeeds only if a response is added; currently the handler returns no response and may result in `404`; `401` session is missing/invalid; `403` permission is missing; `500` database operation fails. |
| GET | `/api/db/clear/images` | `dbRoutes.get('/clear/images')` | `images.clearDB` | Delete all images. | `200` deletion succeeds only if a response is added; currently the handler returns no response and may result in `404`; `401` session is missing/invalid; `403` permission is missing; `500` database operation fails. |
| GET | `/api/db/export/scout` | `dbRoutes.get('/export/scout')` | `scouting.export` | Download `scout_export.zip` containing `scoutforms.csv` and `scoutforms_hist.csv`. | `200` ZIP is returned; `401` session is missing/invalid; `403` permission is missing; `404` session user does not exist; `500` CSV or ZIP generation/database query fails. |
| GET | `/api/db/export/users` | `dbRoutes.get('/export/users')` | `users.export` | Download all users as `users_export.csv`. | `200` CSV is returned; `401` session is missing/invalid; `403` permission is missing; `404` session user does not exist; `500` CSV generation/database query fails. |
| GET | `/api/db/export/images` | `dbRoutes.get('/export/images')` | `images.export` | Download image table data as CSV. | `200` CSV is returned; `401` session is missing/invalid; `403` permission is missing; `404` session user does not exist; `500` CSV generation/database query fails. |

## Permission Middleware

- `requireSession`: requires a valid `session` cookie.
- `requirePermission(permission)`: requires a valid session and the specified role permission.
- Permissions are defined in `packages/shared/src/types/users/Permisson.ts`.
- Any route that does not match these method/path combinations receives the framework's `404 Not Found` response.
- Malformed JSON or an unexpected uncaught exception may also produce a framework-level `500` response.
