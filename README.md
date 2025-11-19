# LiveStore Auth Example with TanStack Start, BetterAuth & Cloudflare

This repo contains an example todo app that showcases how to implement authentication in a local-first app using the following technologies:

- Fullstack React: [TanStack Start](https://tanstack.com/start)
- Data layer: [LiveStore](https://livestore.dev/)
- Authentication: [BetterAuth](https://www.better-auth.com/) & [BetterAuth Cloudflare Plugin](https://github.com/zpg6/better-auth-cloudflare)
- User credential storage: [Cloudflare D1](https://developers.cloudflare.com/d1/)
- Backend syncing: [Cloudflare Workers](https://developers.cloudflare.com/workers/) & [Durable Objects](https://developers.cloudflare.com/durable-objects/)

After authentication, every user of the app receives their own local instance of a LiveStore DB that they can use locally on their machine, ensuring full isolation as well as offline access. 

## Usage

### 1. Clone repo

```
git clone git@github.com:nikolasburk/livestore-tanstack-cloudflare-auth-example.git
cd livestore-tanstack-cloudflare-auth-example
pnpm install
```

### 2. Set env vars

Rename `.env.example` to `.env` and update the env vars in that file as follows.

#### 2.1. D1 database configutation

Create a [D1 database](https://developers.cloudflare.com/d1/) and set the env vars in `.env` as described [here](https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit). Here are some real-looking sample values:

```bash
# replace these values with your own
CLOUDFLARE_ACCOUNT_ID=6cfd2fa210ebf08b224c0f39248e1c05
CLOUDFLARE_DATABASE_ID=d5b3d994-1a05-43cb-8cd5-b668b73d0d53
CLOUDFLARE_D1_TOKEN=XDPhgV57Tr-zljPhXdsyiuAG4V_gjFq1b8FNiZoJ
```

#### 2.2. Better Auth configuration

Set the `BETTER_AUTH_SECRET` to a value of your choice. You can also generate a secret [here](https://www.better-auth.com/docs/installation#set-environment-variables) by clicking on the **Generate Secret** button. Here are some

```bash
# replace these values with your own
BETTER_AUTH_SECRET=i2zaoTAZz0yXjfHlTXIhAxWlERrXoCCn
BETTER_AUTH_URL=http://localhost:3000 # Base URL of your app
```

### 3. Run the app

Now you can run the app with:

```
pnpm dev
```

### 4. Test the app

Here are some things you can do to test the app:

1. Sign up with a new user 
1. Open a new browser window -> the same user should be logged in automatically in both windows now
1. Create a todo in one window -> the second window should update instantly and show the same todo
1. Open an incognito window and sign up with a different user
1. Open another incognito window -> the second user should be logged in automatically in both incognito windows now
1. Create a todo in one incognito window -> the second incognito window should update instantly and show the same todo

### 5. Deploy to Cloudflare

To deploy the app, you can run:

```
pnpm run deploy
```