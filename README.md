# Porum 2 (NextJS)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Duplicate `.env.example` and rename to `.env` (fill the necessary fields).

2. Install dependencies.

```bash
npm i
```

3. Setup Husky (for pre-commit).

```bash
npx husky install
```

> Note (for contributors):
> If you're facing errors when pushing a commit, run the following.
>
> ```bash
> # delete ".git/hooks/" folder manually
> # or run the line below in PowerShell
> rm -rf .git/hooks/
> npm uninstall husky
> npm install --save-dev husky
> ```
>
> If you're using GitHub Desktop, make sure to add `C:\Program Files\Git\bin`
> to your **User** and **System** PATH.
> Learn more in the following solutions: [Solution 1](https://github.com/desktop/desktop/issues/17385#issuecomment-1718170235) and [Solution 2](https://github.com/desktop/desktop/issues/12586#issuecomment-1822189613)

4. Run database with docker

```bash
docker compose up
```

5. Push schema to database

```bash
npm run db:push
```

6. Run the development server.

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Other

### View database

Simply run the following command to open Drizzle Studio. If you have any issues, check this [solution](https://github.com/sameersbn/docker-postgresql/issues/112#issuecomment-579712540)

```bash
npm run db:studio
```

### Full reset database

Go to `local.drizzle.studio` on your browser after running `npm run db:studio`, paste the following into SQL Runner and then execute:

```
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
      EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;
```

Run `npm run db:push` to create the necessary tables to PostgreSQL.
