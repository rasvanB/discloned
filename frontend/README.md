## Discord Clone
### Features
- Real-time messaging using Socket.io
- Send attachments as messages using UploadThing
- Delete & Edit messages in real time for all users
- Create Text, Audio and Video call Channels
- Member management (Kick, Role change)
- Unique invite link generation & full working invite system
- Infinite loading for messages
- Server creation and customization
- Beautiful UI using TailwindCSS and ShadcnUI
- Full responsivity and mobile UI
- Light / Dark mode
- Websocket fallback: Polling with alerts
- ORM using Drizzle
- MySQL database using Planetscale
- Authentication with NextAuth
---
### Stack:
- React with Next 13
- TailwindCSS for styling
- ShadcnUI for ui components
- Socket.io for real-time communication
- tRPC for API type-safety
- PlanetScale MySQL for database
- DrizzleORM
- NextAuth for authentication
- UploadThing for file uploads
- LiveKit for video/voice chat
- Vercel for hosting
- T3 Env for environment variables type-safety

### Prerequisites

**Node version 18.x.x**

### Install packages

```shell
npm i
```

### Setup .env file


```js
DATABASE_HOST=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_URL=
AUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=


NEXT_PUBLIC_BACKEND_URL=
    
UPLOADTHING_SECRET=

NEXT_PUBLIC_LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_SECRET=
```

### Start the app

```shell
npm run dev
```

## Available commands

Running commands with npm `npm run [command]`

| command     | description                              |
|:------------|:-----------------------------------------|
| `dev`       | Starts a development instance of the app |
| `db:push`   | Push your schema to db                   |
| `db:studio` | Starts up Drizzle Studio                 |
