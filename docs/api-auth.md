# Authentication API

The frontend is the source of this contract. The backend must follow it exactly.

## Basics

- Base path: `/api`. JSON in, JSON out. The backend listens on port **4000** in development.
- The app and the API share one address (Vite proxies `/api` in development), so there is no CORS.
- Sessions use one cookie, `mm_session`: an opaque random value (at least 256 bits). The server
  stores only a **hash** of it, with an expiry. Cookie attributes: `HttpOnly`, `SameSite=Lax`,
  `Path=/`, and `Secure` in production. The frontend never reads it.
- Every non-GET request must send `X-Requested-With: monetary-mosaic`. Without it, answer
  `403` with code `csrf`.

## Errors

Every failure has this shape, so the frontend can show it:

```json
{
  "error": {
    "code": "invalid_credentials",
    "message": "…",
    "fields": { "email": "…" },
    "retryAfterSeconds": 30
  }
}
```

`fields` and `retryAfterSeconds` are optional. Codes:

| Status | Code                  | When                                                        |
| ------ | --------------------- | ----------------------------------------------------------- |
| 400    | `validation`          | A field is missing or invalid. Put messages in `fields`.    |
| 401    | `invalid_credentials` | Wrong email or password. **Same answer for both.**          |
| 401    | `unauthorized`        | No valid session.                                           |
| 403    | `csrf`                | The `X-Requested-With` header is missing.                   |
| 409    | `email_taken`         | Sign-up with an email that already has an account.          |
| 429    | `too_many_attempts`   | Rate limit hit. Send `Retry-After` and `retryAfterSeconds`. |
| 500    | `server`              | Anything unexpected. Never include internal details.        |

## Endpoints

### `POST /api/auth/signup`

Request: `{ "email": "name@example.com", "password": "…" }`

- `201` `{ "user": { "id": "…", "email": "name@example.com" } }` and sets the session cookie,
  so the person is signed in straight away.
- Email: trim, lowercase, at most 254 characters, a valid format, unique.
- Password: 8 to 128 characters, no other composition rules. Refuse very common passwords.
  Field messages: "Use at least 8 characters.", "That password is too common. Choose another."

### `POST /api/auth/login`

Request: `{ "email": "…", "password": "…" }`

- `200` `{ "user": { "id": "…", "email": "…" } }` and sets a **new** session cookie (never reuse
  one from before sign-in).
- Wrong email and wrong password give the same `401 invalid_credentials`, and take the same
  time (hash against a dummy value when the email is unknown).

### `POST /api/auth/logout`

- `204`, no body. Deletes the session on the server and clears the cookie. Safe to call when
  already signed out.

### `GET /api/auth/me`

- `200` `{ "user": { "id": "…", "email": "…" } }` when the cookie is a live session.
- `401 unauthorized` otherwise. Sliding expiry: 14 days of inactivity.

## Security requirements

- Hash passwords with **argon2id**. Never log, return, or store a password or session value.
- Rate-limit login (per IP and per email) and signup (per IP).
- Serve only over HTTPS in production, with HSTS.
- Keep `email_taken` for now. It makes sign-up clear but confirms an account exists, so it
  must stay behind the signup rate limit. Revisit when email verification exists.
