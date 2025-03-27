// docs/deployment-checklist.md
const productionDeployment = {
  preDeployment: [
    "環境変数の設定確認",
    "Supabase本番プロジェクトの準備",
    "ビルドテスト実行"
  ],
  deployment: [
    "静的ファイルのアップロード",
    "環境変数の設定",
    "SSL証明書の設定"
  ],
  postDeployment: [
    "動作確認",
    "パフォーマンステスト",
    "エラーログの確認"
  ]
};