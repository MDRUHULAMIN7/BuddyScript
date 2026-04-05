# BuddyScript Backend

Backend API for BuddyScript, a social feed application built with Express, TypeScript, MongoDB, and cookie-based JWT authentication. This repository handles authentication, profile access, post creation, comments, reactions, and media upload integration for the BuddyScript frontend.

## Submission Links

- Backend repository for code review: [BuddyScript Backend](https://github.com/MDRUHULAMIN7/BuddyScript)
- Frontend repository for code review: [BuddyScript Frontend](https://github.com/MDRUHULAMIN7/BuddyScript-Frontend-)
- Live API base URL: [https://buddy-script-umber.vercel.app/api/v1](https://buddy-script-umber.vercel.app/api/v1)
- Health check: [https://buddy-script-umber.vercel.app/api/v1/health](https://buddy-script-umber.vercel.app/api/v1/health)
- Live frontend consuming this API: [https://buddy-script-frontend-beryl.vercel.app](https://buddy-script-frontend-beryl.vercel.app)
- Video walkthrough: https://youtu.be/BPAlDkaMrnI

## What I Built

- An `Express + TypeScript` REST API for a social feed application.
- Cookie-based authentication with login, registration, logout, and authenticated profile access.
- Endpoints for posts, threaded comments, and reactions across multiple target types.
- Media upload support for post images through Cloudinary.
- Shared middleware for authentication, validation, 404 handling, and centralized error responses.

## Key Engineering Decisions

- I structured the backend by feature module (`auth`, `users`, `posts`, `comments`, `reactions`) so controller, service, route, and validation logic stay easy to navigate.
- I used HTTP-only cookie-based JWT auth to align with the frontend experience while reducing client-side token handling complexity.
- I used MongoDB with Mongoose to model user, post, comment, and reaction data in a way that supports feed-style retrieval patterns.
- I added a centralized error pipeline to keep API responses more predictable and reduce duplicated error handling in controllers.
- I kept Cloudinary integration behind configuration so media upload support can be enabled in production without hardwiring storage logic into the request layer.

## API Overview

Base path: `https://buddy-script-umber.vercel.app/api/v1`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

### Users

- `GET /users/me`
- `PATCH /users/me`

### Posts

- `POST /posts`
- `GET /posts`
- `GET /posts/:postId`

### Comments

- `POST /comments`
- `GET /comments`

### Reactions

- `PUT /reactions/:targetType/:targetId`
- `DELETE /reactions/:targetType/:targetId`
- `GET /reactions/:targetType/:targetId`

## Tech Stack

- Express
- TypeScript
- MongoDB
- Mongoose
- JSON Web Token
- Cookie Parser
- CORS
- Multer
- Cloudinary
- Zod

## Local Development

```bash
npm install
npm run dev
```

The API starts locally at `http://localhost:5000`.

## Environment Variables

Create `backend/.env` and provide the following values:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime mode such as `development` or `production` |
| `PORT` | Port used by the API server |
| `DATABASE_URL` | MongoDB connection string |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost factor |
| `JWT_ACCESS_SECRET` | Secret used to sign access tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry duration |
| `AUTH_COOKIE_NAME` | Cookie name used for the auth token |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Example local shape:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=<your-mongodb-connection-string>
BCRYPT_SALT_ROUNDS=12
JWT_ACCESS_SECRET=<your-jwt-secret>
JWT_ACCESS_EXPIRES_IN=7d
AUTH_COOKIE_NAME=buddyscript_access_token
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

Do not commit real credentials to version control. Store production secrets in your hosting provider's environment settings.

## Available Scripts

- `npm run dev`: start the development server with file watching
- `npm run build`: compile TypeScript to `dist`
- `npm run start`: run the compiled build
- `npm run lint`: run ESLint
- `npm run lint:fix`: automatically fix lint issues where possible
- `npm run format`: format TypeScript source files with Prettier

## Reviewer Notes

- This API is configured to support credentialed requests from local development and the deployed frontend.
- The frontend companion repository linked above contains the full UI implementation that consumes this API.
- For review, the health endpoint is the fastest way to confirm that the deployed backend is reachable.
