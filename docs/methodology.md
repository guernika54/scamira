# 検出方法論 / Detection Methodology

> **For English readers:** This document explains Scamira's detection methodology. The full prompt is in [`src/prompts.ts`](../src/prompts.ts). In short: Scamira classifies funnel signals into **strong / medium / weak** tiers (Manychat-style comment-to-DM automation, exaggerated income claims, manufactured scarcity, mechanism opacity, list-building, etc.) and produces a 0–100 score based on how many signals appear and at what strength. It analyzes **post structure only** — never the individual poster — and deliberately avoids "scam" verdicts. The pattern taxonomy was tuned on Japanese social media but the underlying structure is universal; English posts are analyzed with the same criteria. Detailed tier definitions follow in Japanese below.

---

Scamiraがどのように「情弱ビジネス・パターン」を検出しているか、その全ロジックを公開します。

## 基本方針

1. **構造の分析であって、人格の評価ではない**
   検出対象は **投稿テキストの構造** のみです。発信者個人の人柄、商売の実態、法的な是非は判定しません。

2. **「詐欺判定ツール」ではない**
   「詐欺かどうか」を判定するものではなく、**情弱ビジネスに典型的なマーケティング手法が、どれだけ含まれているか** を可視化するツールです。

3. **完全な透明性**
   検出に使うすべてのプロンプト・ロジックを公開しています（[`src/prompts.ts`](../src/prompts.ts)）。ブラックボックスにしません。

## シグナル分類

検出パターンを **強・中・弱** の3段階に分類しています。

### 🔴 強シグナル（重み付け：3）

情弱ビジネス特有の手法。これらの組み合わせがあると、構造的にファネル誘導の意図が明確と判定されます。

| パターン | 例 |
|---|---|
| **Manychatファネル誘導** | 「コメントに○○と書いて」「DMします」「ガイド送ります」 |
| **収入の誇大アピール** | 「月100万円」「寝てる間に売れる」「146,400円入ってた」 |
| **権威付けの過剰演出** | 「累計○万円売上」「○年で○万円自己投資」「12万件売れてる」 |
| **希少性・FOMO** | 「今だけ」「ブルーオーシャン」「日本ではまだ少ない」「先行者利益」 |
| **メカニズムの不透明化** | 「特別な方法」「秘密」「裏技」「○○するだけ」 |

### 🟡 中シグナル（重み付け：2）

単独では決定的ではないが、強シグナルと組み合わさると効果を増幅するパターン。

| パターン | 例 |
|---|---|
| **努力否定** | 「初心者OK」「スキル不要」「自動化」「片手間」 |
| **未来損失フレーミング** | 「今やらないと後悔」「○年後に差がつく」 |
| **公式LINE誘導** | 「公式LINE登録で」「LINEで限定」「無料プレゼント」 |
| **ライフスタイル演出** | 「朝の通知」「寝てる間」「子供との時間」 |

### 🟢 弱シグナル（重み付け：1）

副業系発信に頻出するが、単独では情弱ビジネス断定の根拠にならないもの。

| パターン | 例 |
|---|---|
| **ハッシュタグクラスタ** | #副業 #在宅 #ママ起業 #フリーランス の同時使用 |
| **絵文字の過剰使用** | ✨🎉💰🔥🎁の連発 |
| **「○○だけ」構文** | 作業の単純化を強調 |

## スコアリング

スコアは0〜100で、シグナルの **数** と **強さ** の組み合わせで決定されます。

- **0〜29** 🟢 低リスク：通常の発信、商品宣伝、日常投稿
- **30〜69** 🟡 注意：いくつかのファネル要素あり
- **70〜100** 🔴 高リスク：複数の強シグナルが組み合わさり、典型的なファネル構造

具体的な数値判定はLLM（Claude Haiku 4.5）が行うため、同じ投稿でも実行ごとに数点の差が出ることがあります。

## やらないこと

Scamiraは以下を **行いません**：

- 発信者個人の名前を出した断定的な評価
- 「詐欺師」「悪質」などの人格攻撃的なラベリング
- 投稿の真偽の確認（実際に売れているか、収入は本当かなど）
- 法的な助言

## 異議申立て

誤判定や改善提案がある場合：

- **GitHub Issue** で報告：`https://github.com/guernika54/scamira/issues`
- 投稿テキスト・分析結果・なぜ問題と考えるかを書いてください

## 検出パターンの追加・更新

新しい情弱ビジネスのパターンを発見した場合、PRで [`src/prompts.ts`](../src/prompts.ts) を更新してください。

例：
- 新しいプラットフォームのファネル手法
- 業界特有のマーケティング常套句
- AI生成系商品の新しい売り方
