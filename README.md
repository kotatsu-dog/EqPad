# EqPad — 数式エディタ

LaTeXに不慣れでも数式を簡単に作成し、Markdown・PNG・SVGとして出力できるWebアプリです。

## 環境構築

### 必要な環境

- Node.js 22 以上
- npm

### 開発環境のセットアップ

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開く

### 本番環境のビルド

```bash
# ビルド
npm run build

# ビルド後のアプリを起動
npm run start
```

## Docker での実行

### Docker イメージのビルドと実行

```bash
# イメージをビルド
docker build -t eqpad .

# コンテナを実行
docker run -p 3000:3000 eqpad
```

### Docker Compose での実行

```bash
# サービスを起動
docker-compose up -d

# ログを表示
docker-compose logs -f

# サービスを停止
docker-compose down
```

## 環境変数

`.env.example` をコピーして `.env.local` を作成し、必要な環境変数を設定してください。

```bash
cp .env.example .env.local
```

### 主な環境変数

- `NEXT_PUBLIC_APP_URL`: アプリケーションのURL（OGP設定用）
- `NODE_ENV`: 実行環境（development / production）

## 機能

- 数式エディタでLaTeX形式の数式を入力
- LaTeXコードをコピー（展開版も対応）
- Markdown形式でコピー（displayモード、inlineモード）
- PNG形式で出力
- 履歴機能で以前の数式を復元

## セキュリティ

以下のセキュリティ対策を実装しています：

- HTTP Strict-Transport-Security (HSTS)
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- Referrer-Policy: strict-origin-when-cross-origin

## デプロイ

### Vercel への デプロイ

最も簡単な方法です。[Vercel Platform](https://vercel.com/new) で連携してデプロイできます。

### その他のプラットフォーム

- Docker コンテナとしてホスティングサービスにデプロイ可能
- Node.js をサポートするプラットフォーム（Render、Railway、Flyなど）

## 開発について

### Linting

```bash
npm run lint
```

### 必要なライブラリ

- **Next.js**: フレームワーク
- **React**: UI ライブラリ
- **Tailwind CSS**: スタイリング
- **mathlive**: 数式エディタ
- **html2canvas**: PNG 出力用

## ライセンス

[MIT](./LICENSE)

## 参考資料

- [Next.js ドキュメント](https://nextjs.org/docs)
- [MathLive ドキュメント](https://cortexjs.io/docs/mathlive/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**開発前のチェックリスト対応状況**

- [x] セキュリティレスポンスヘッダ設定
- [x] OGP設定
- [x] アクセシビリティ対応
- [x] ファビコン・apple-touch-icon設定
- [x] robots.txt設定
- [x] Docker対応
- [x] 環境変数設定例
