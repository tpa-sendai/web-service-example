import express from 'express';
import { Client } from 'pg';
import { readFileSync } from "node:fs";

// データベースの接続情報を記載
// この情報は講師よりSlackで提供します。
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
  ssl: {
    ca: readFileSync(new URL('./global-bundle.pem', import.meta.url), 'utf8'),
    rejectUnauthorized: true,
  },
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
// クライアントからのリクエストを処理するコード
app.get('/items', async (req, res) => {
  // SQLを実行し、結果を取得する
  let result = await client.query('SELECT id, name, genre FROM items ORDER BY id');

  // 取得した結果をejsに渡す
  res.render('items/index', {
    items: result.rows,
    itemCount: result.rowCount,
  });
});

app.get('/items/add', async (req, res) => {
  res.render('items/add');
});

app.post('/items/add', async (req, res) => {
  // フォームから送信されたデータを取得
  let name = req.body.name;
  let genre = req.body.genre;

  // SQLを実行してデータを登録
  let query = 'INSERT INTO items (name, genre) VALUES ($1, $2)';
  let values = [name, genre];
  await client.query(query, values);

  // 商品一覧画面に遷移
  res.redirect('/items');
});

// 商品更新処理
app.get('/items/edit/:id', async (req, res) => {
  // URL中の「id」を取得
  let id = req.params.id;

  // SQLを実行してデータを取得
  let query = 'SELECT id, name, genre FROM items WHERE id = $1';
  let values = [id];
  let result = await client.query(query, values);

  // 該当するIDの商品が存在しているか確認
  if (result.rowCount === 0) {
    // 該当するIDの商品が存在しない場合は404エラーとする
    return res.status(404).send('Item not found');
  }

  // 該当するIDの商品が存在した場合は、編集ページを表示する
  res.render('items/edit', {
    item: result.rows[0],
  });
});

app.post('/items/edit/:id', async (req, res) => {
  // URL中の「id」を取得
  let id = req.params.id;

  // フォームから送信されたデータを取得
  let name = req.body.name;
  let genre = req.body.genre;

  // SQLを実行してデータを更新
  let query = 'UPDATE items SET name = $1, genre = $2 WHERE id = $3';
  let values = [name, genre, id];
  await client.query(query, values);

  // 商品一覧画面に遷移
  res.redirect('/items');
});

app.post('/items/delete', async (req, res) => {
  // フォームから送信されたデータを取得
  let id = req.body.id;

  // SQLを実行してデータを削除
  let query = 'DELETE FROM items WHERE id = $1';
  let values = [id];
  await client.query(query, values);

  // 商品一覧画面に遷移
  res.redirect('/items');
});

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
