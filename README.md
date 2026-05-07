# Scamira

> SNSの副業系発信に含まれる「情弱ビジネス・パターン」を構造的に検出するオープンソースツール
>
> An open-source tool for detecting predatory info-marketing patterns on Japanese social media.

## なぜ作ったか

SNSには、情報格差を利用して初心者から教材費を巻き上げる「情弱ビジネス」が氾濫しています。Manychatによる自動DM、根拠不明な収入実績、希少性アピール、PLR/MRR再販ビジネス——これらは見た目こそ違えど、構造的に共通したパターンを持っています。

Scamiraはその構造を**透明な検出ロジック**で可視化し、誰もが「なぜこの投稿は怪しいのか」を自分の言葉で理解できるようにすることを目指します。

「情弱ビジネス」を駆逐したいわけではありません。判断材料を、本来買い手側に提供されるべき情報を、提供したいだけです。

## 何ができるか（MVP）

- SNS投稿のテキストをペースト → AI分析で「情弱ビジネス度」を0〜100でスコアリング
- 検出されたパターンを **強・中・弱** のシグナル区分と根拠引用付きで表示
- 検出ロジック・プロンプトを **完全公開**

## 技術スタック

- **Frontend**: TailwindCSS (CDN), Vanilla JS
- **Backend**: Cloudflare Workers (TypeScript)
- **LLM**: Anthropic Claude Haiku 4.5
- **Hosting**: Cloudflare (Pages + Workers)

## ローカル開発

```bash
# 依存関係インストール
npm install

# Anthropic API キーを設定
cp .dev.vars.example .dev.vars
# .dev.vars を編集して ANTHROPIC_API_KEY を入れる

# 開発サーバー起動
npm run dev
# → http://localhost:8787 で起動
```

## 透明性ポリシー

- **検出ロジックは完全公開**：[`src/prompts.ts`](src/prompts.ts) と [`docs/methodology.md`](docs/methodology.md) を参照
- **個人攻撃しない**：投稿の構造のみ分析、発信者の人格は評価しない
- **断定しない**：「詐欺」「悪質」と判定するものではなく、パターンの可視化が目的
- **異議申立て歓迎**：誤判定があれば Issue または PR で指摘してください

## 開発状況

🚧 MVP開発中（2026-05-07 開始）

- [x] 検出プロンプト
- [x] Cloudflare Workers バックエンド
- [x] フロントエンド（テキストペースト型）
- [ ] 公開デプロイ
- [ ] URL自動取得（Instagram, X, TikTok, YouTube）
- [ ] 分析履歴の保存
- [ ] アカウント単位の集計
- [ ] Chrome拡張

## ライセンス

[MIT](LICENSE)

## コントリビュート

Issue / PR 大歓迎。情弱ビジネスのパターンを見つけたら、検出ロジック改善のために共有してください。
