# 003_nodejs_environment.md

## 決定事項: Node.js環境の統一

### 状況
- 複数のNode.jsバージョンが混在（v14.21.3とv16.20.2）
- システムがv14.21.3を優先して使用
- nvmによるバージョン管理が正常に機能していない

### 決定内容
1. Node.jsバージョンをv16.20.2に統一
2. 古いNode.jsインストールをバックアップ
3. PATHから古いNode.jsディレクトリを除外
4. nvmによる環境管理を採用

### 技術的理由
1. プロジェクト要件との整合性
   - Next.jsの動作要件に合致
   - npm v8.19.4が利用可能

2. 環境の一貫性
   - 開発環境の統一
   - 依存関係の互換性確保

### 実装詳細
```bash
# 1. 古いNode.jsのバックアップ
mv ~/nodejs ~/nodejs_backup

# 2. PATHの修正
export PATH=$(echo $PATH | tr ':' '\n' | grep -v "nodejs" | tr '\n' ':' | sed 's/:$//')

# 3. .bashrcへの永続化
# Remove old nodejs from PATH
export PATH=$(echo $PATH | tr ':' '\n' | grep -v "nodejs" | tr '\n' ':' | sed 's/:$//')

# 4. nvmによるNode.js管理
nvm use 16.20.2
```

### 影響範囲
- 実行環境：Node.js v16.20.2
- パッケージマネージャ：npm v8.19.4
- 既存スクリプトの動作確認が必要

### 確認方法
```bash
node -v  # v16.20.2
which node  # ~/.nvm/versions/node/v16.20.2/bin/node
```

### 参照
- チャットログ: chat_002.md
- マスターガイドライン: Node.js環境要件
