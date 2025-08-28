import express from 'express';
import { Client } from 'pg';

// データベースの接続情報を記載
// この情報は講師よりSlackで提供します。
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

// Expressの設定
const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

// ---- これより上は変更しないでください ----
// ---- これより下は変更しないでください ----
// データベースに接続するコード
try {
  await client.connect();
} catch (err) {
  console.error(`データベースの接続に失敗しました: ${err}`);
  console.error(err.stack);
  process.exit(1);
} 

// サーバを起動するコード
const port = 3000;
try{
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
} catch (err) {
  console.error(`サーバの起動に失敗しました: ${err}`);
  console.error(err.stack);
}
