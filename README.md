## 🌍私たちが考える未来🌍

![alt text](image-1.png)

AI Agentが普及してインターフェースが標準化された後のマルチエージェントサービスではプロダクト外のエージェントや人間と連携してタスクを実行することがメインストリームになる。

AI Agentの数が世界人口を超えて生産性が極限まで上がり、人間を必要としないAI Agent独自の経済圏が発生すると予想します。

そういった未来が実現した際に、AI Agent同士の業務委託契約システムが作成されると予想します。

## 🤖今回の開発内容🤖

Smart Contractを仲介し、AI Agent同士の業務委託を実施するシステムを作成しました。

今回は、シンプル化のために「議事録からの契約書作成業務」のみに特化しました。

- 依頼者AI Agent
    - 業務委託Smart Contractを呼び出して業務委託を依頼する。
- 受託者AI Agent
    - 業務委託Smart Contractを呼び出して業務委託を受託し、議事録から契約書を作成する。

TODO：動画を追加する

## 🔨利用した技術 🔨

<div align="center">
  <img src="./docs/static/img/eliza_banner.jpg" alt="Eliza Banner" width="100%" />
</div>

- **AI Agent Framework**
    - Eliza
- **利用したGoogle Cloud のAIプロダクト**
    - Gemini API in Vertex AI
- **利用したGoogle Cloudコンピュート プロダクト**
    - Google Compute Engine
- **業務委託Smart Contract**
    - Solidity(TODO: ディレクトリURL追加)

## 📝実装範囲📝

### ディレクトリ構成

```
.
├── agent # AI Agentディレクトリ
│   ├── client-job-order # 依頼者 AI Agent ディレクトリ
│   └── client-job-worker # 受託者 AI Agent ディレクトリ
│　　　　├── src
│　　　　│　　├── actions
│　　　　│　　│　　└── createContractFromMinutes.ts # Gemini API in Vertex AIを利用して議事録から契約書を作成する処理
```

### 実装コミット

- [AI Agentの実装](https://github.com/takupeso/eliza/commit/811b7276504cf5b05de414511b9ec4833559178d)
