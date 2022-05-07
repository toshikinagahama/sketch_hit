# 本アプリケーションの概要
# シーケンス 
## 課題実行〜結果画面閲覧まで
```mermaid
sequenceDiagram
participant user as ユーザー
participant frontend as フロントエンド
participant backend as バックエンド
user ->>+ frontend: アクセス
frontend ->>- user: Top画面返却
user ->>+ frontend: ユーザー名登録
frontend ->>- user: 課題選択画面返却
user ->>+ frontend: 課題選択
frontend ->>- user: 課題画面返却
user ->>+ frontend: 課題実行
frontend ->>+ backend: 結果保存
backend -->>- frontend: 保存完了レスポンス
frontend ->>- user: 結果画面返却
```
## 過去データ閲覧 
```mermaid
sequenceDiagram
participant user as ユーザー
participant frontend as フロントエンド
participant backend as バックエンド
user ->>+ frontend: アクセス
frontend ->>- user: Top画面返却
user ->>+ frontend: 結果選択画面へ 
frontend ->>- user: 結果選択画面返却
user ->>+ frontend: 結果選択
frontend ->>- user: 結果画面返却
```
# 画面一覧
| 画面         | 説明                                            | URL             |
| :----------- | ----------------------------------------------- | --------------- |
| トップ画面   | ・名前入力し課題選択画面へ<br>・結果選択画面へ  | /top            |
| 課題選択画面 | 正円、縦直線、横直線、楕円を選択できる          | /select_task    |
| 課題実行画面 | 各課題を実行できる                              | /do_task        |
| 結果選択画面 | 閲覧したい過去データを選択できる                | /select_results |
| 結果画面     | 結果idに対応した結果が閲覧できる（result/<id>） | /result/<id>    |
| API画面      | 過去の結果をjson形式で返却する                  | /api/results    |

# 技術構成
## backend
backendのwebサーバーはGo言語で作成した。

主な使用ライブラリは以下の通り。
| 項目                     | 説明                                                                 | 備考                                |
| ------------------------ | :------------------------------------------------------------------- | ----------------------------------- |
| github.com/labstack/echo | webフレームワーク。                                                  |                                     |
| Logger                   | ロガー。                                                             | github.com/labstack/echo/middleware |
| Recover                  | パニックを起こしてもプログラムが<br>終了しないようにするmiddleware。 | github.com/labstack/echo/middleware |
| gorm.io/gorm             | ORMライブラリ。                                                      |                                     |
| github.com/spf13/viper   | 設定ファイルや環境変数を<br>簡単に扱えるライブラリ。                 |                                     |

## frontend
frontendはNext.jsを用いて作成した。
| 項目     | 説明                                               | 備考 |
| -------- | :------------------------------------------------- | ---- |
| Next.js  | Reactベースのwebフレームワーク。                   |      |
| three.js | Apple Pencilの動きを3Dで可視化するためのライブラリ |      |
| recoil   | グローバルに状態を管理する<br>ライブラリ。         |      |

## database
データベースはpostgresを使った。テーブルは以下の通り。
```mermaid
erDiagram

results {
  uuid   id "結果id"
  string username "ユーザーネーム"
  string tasktype "課題のタイプ（直線、円）" 
  real   param1   "課題図形のパラメータ（座標など）"
  real   param2   "課題図形のパラメータ（座標など）" 
  real   param3   "課題図形のパラメータ（座標など）"
  real   param4   "課題図形のパラメータ（座標など）"
  real   param5   "課題図形のパラメータ（座標など）"
  real   param6   "課題図形のパラメータ（座標など）"
}

result_param {
  bigint id      "result_time_series_id"
  uuid result_id "結果id"
  string name    "パラメータの名前（x,y,r,theta,...)"
  real value     "パラメータの値"
}

result_time_series {
  bigint id      "result_time_series_id"
  uuid result_id "結果id"
  integer index  "結果のindex"
  integer time   "そのindexのtime"
  integer x      "そのindexのx座標"
  integer y      "そのindexのy座標"
  real distance  "そのindexの目標図形とのズレ" 
  real pressure  "そのindexの筆圧" 
  real altitude  "そのindexのaltitude" 
  real azimuth   "そのindexのazimuth" 
}
```


