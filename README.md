# Cognito マネージドログイン サンプル

このプロジェクトは、Amazon Cognito マネージドログインを使用した認証機能を実装したReactアプリケーションです。AWS Amplify v6 の最新APIを使用してCognitoとの連携を行います。

## 機能

- Cognito マネージドログインを使用したサインイン/サインアップ
- ユーザー情報の取得と表示
- IDトークンの表示
- サインアウト機能

## 使用技術

- React 18
- AWS Amplify v6
- Material UI (MUI v5)
- AWS Cognito

## 前提条件

- Node.js (v14以上)
- npm または yarn
- AWS アカウント
- Cognito User Pool の設定（マネージドログイン有効化済み）

## Cognito設定手順 (2025年最新コンソール)

1. **Cognito User Poolを作成する**
   - AWS管理コンソールにログイン
   - Cognitoサービスを開く
   - 「User Pools」を選択し、「Create user pool」をクリック
   - 認証プロバイダーの選択で「Cognito user pool」を選択
   - サインインオプションを設定（Email、ユーザー名など）
   - 必要なセキュリティ要件を設定（パスワードポリシーなど）

2. **アプリケーションクライアントを設定する**
   - ユーザープール作成の中で「App integration」セクションに進む
   - アプリケーションタイプとして「Public client」を選択
   - アプリクライアント名を入力
   - 「Don't generate client secret」にチェック（SPAでは通常不要）
   - 「Cognito user pool」を認証プロバイダーとして選択
   - 「Authorization code grant」を選択（OAuth 2.0フロー）
   - OAuthスコープとして「email」「openid」「aws.cognito.signin.user.admin」を選択
     - 重要: アプリケーションコードと完全に一致するスコープを選択する必要があります

3. **コールバックURLとサインアウトURLを設定する**
   - 「Allowed callback URLs」に `http://localhost:3000/` を入力（開発環境用）
   - 「Allowed sign-out URLs」に `http://localhost:3000/` を入力
   - 本番環境用のURLも必要に応じて追加

4. **ドメイン名を設定する**
   - ユーザープール作成後、該当するユーザープールを選択
   - 「App integration」タブを選択
   - 「Domain」セクションに移動
   - 「Actions」→「Create Cognito domain」を選択
   - ドメインプレフィックスを入力して「Save changes」をクリック
   - このドメインが `REACT_APP_COGNITO_DOMAIN` の値になります

## プロジェクトのセットアップ

1. リポジトリをクローン
```
git clone <repository-url>
cd cognito-simple
```

2. 必要なパッケージをインストール
```
npm install
```
または
```
yarn install
```

3. 環境変数の設定
`.env.sample` をコピーして `.env` ファイルを作成し、Cognito設定を入力します：
```
cp .env.sample .env
```

次に、`.env` ファイルを編集して、以下の値を設定します：
```
REACT_APP_REGION=ap-northeast-1  # あなたのリージョン
REACT_APP_USER_POOL_ID=ap-northeast-1_xxxxxxxxx  # ユーザープールID
REACT_APP_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx  # アプリクライアントID
REACT_APP_COGNITO_DOMAIN=your-domain-prefix.auth.ap-northeast-1.amazoncognito.com  # Cognitoドメイン
REACT_APP_REDIRECT_SIGN_IN=http://localhost:3000/  # リダイレクトURL（開発環境）
REACT_APP_REDIRECT_SIGN_OUT=http://localhost:3000/  # サインアウト後のリダイレクトURL（開発環境）
```

## アプリケーションの実行

開発サーバーを起動します：

```
npm start
```
または
```
yarn start
```

ブラウザで http://localhost:3000 にアクセスするとアプリケーションが起動します。

## アプリケーションの使い方

1. 「Cognitoでサインイン」ボタンをクリックすると、Cognito マネージドログインにリダイレクトされます
2. ホスティング済みのログイン画面でユーザー登録またはサインインを行います
3. 認証成功後、アプリケーションにリダイレクトされ、ユーザー情報が表示されます
4. 「IDトークンを表示」ボタンをクリックすると、認証トークンの詳細を確認できます
5. 「サインアウト」ボタンをクリックするとログアウトします

## 実装の主なポイント

- AWS Amplify v6の新しいモジュール方式APIを使用
  - `signInWithRedirect` - マネージドログインへのリダイレクト
  - `fetchUserAttributes` - ユーザー属性の取得
  - `fetchAuthSession` - 認証セッション情報の取得（トークンを含む）
  - `getCurrentUser` - 現在のユーザー情報取得
  - `signOut` - サインアウト処理
- Material UIを使用したモダンなUIデザイン
- 日本語UIのサポート
- エラーハンドリングの実装

## トラブルシューティング

- **「invalid_scope」エラーが表示される**
  - このエラーは、アプリケーションコードで指定されたスコープとCognitoコンソールで設定されたスコープが一致しないことが原因です。
  - Cognitoコンソールで、アプリクライアント設定のスコープが `email`, `openid`, `aws.cognito.signin.user.admin` になっていることを確認してください。
  - コードの `config.js` ファイルのスコープ設定がCognitoコンソールと一致していることを確認してください。

- **サインインボタンをクリックしてもマネージドログインにリダイレクトされない**
  - `.env` ファイルの設定値（特にドメインとアプリクライアントID）を確認
  - CognitoコンソールでコールバックURLが正しく設定されているか確認
  - ブラウザのコンソールログでエラーメッセージを確認

- **認証後にアプリケーションにリダイレクトされない**
  - CognitoコンソールでコールバックURLが正しく設定されているか確認
  - アプリケーションの実行URLがコールバックURLと完全に一致しているか確認（末尾のスラッシュも含めて）

- **URLパラメータでエラーが返される場合**
  - アプリケーションはURL内のエラーパラメータを検出し、エラーメッセージを表示します
  - 表示されたエラーメッセージの内容を確認し、該当する設定を修正してください

## 本番環境への展開

本番環境にデプロイする場合は、以下の点に注意してください：

1. Cognitoの設定で、本番環境のURLをコールバックURLとサインアウトURLに追加する
2. `.env.production` ファイルを作成し、本番用の設定値を指定する
3. HTTPS通信を使用する

## マネージドログインのカスタマイズ

Cognito マネージドログインは、AWS管理コンソールから以下の要素をカスタマイズできます：

- ロゴ
- CSSスタイル
- 表示言語

カスタマイズ方法：
1. Cognitoコンソールでユーザープールを選択
2. 「App integration」タブを選択
3. 「マネージドログインカスタマイズ」セクションでカスタマイズを行う

## 日本語対応について

日本語表示を有効にするには、サインイン時に言語パラメータを指定します：

```javascript
await signInWithRedirect({
  options: {
    lang: "ja"
  }
});
```