# 我慢カウンター

我慢するものを登録し、今日「我慢できなかった回数」をカウントする Next.js アプリです。Clerk で認証し、Neon PostgreSQL に Prisma で保存します。

## セットアップ

1. `.env.example` を参考に `.env` を作成
2. Neon の `DATABASE_URL` と Clerk のキーを設定
3. 依存関係をインストール
4. DB にテーブルを作成
5. 開発サーバーを起動

```bash
npm install
npm run prisma:migrate
npm run dev
```

## 主なコマンド

```bash
npm run dev
npm run build
npm run typecheck
npm run prisma:generate
npm run prisma:studio
```

Prisma 7 の構成に合わせて、接続 URL は `prisma.config.ts` と Neon adapter が `DATABASE_URL` から読みます。

## Vercel

本番 URL は `https://gaman-app-dun.vercel.app/` です。アプリ内のサインイン、サインアップ URL は相対パスで扱うため、ソースコード内に `localhost` 固定の URL は不要です。

Vercel の Environment Variables には、Neon の `DATABASE_URL`、Clerk の publishable key / secret key、Clerk のサインイン・サインアップ URL を設定します。`NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` と `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` は本番 URL に向けます。
