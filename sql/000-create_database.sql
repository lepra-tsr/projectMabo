CREATE DATABASE IF NOT EXISTS fireworks
  CHARACTER SET utf8;


CREATE TABLE news (
  id          INT(11)      NOT NULL AUTO_INCREMENT,
  title       VARCHAR(128) NOT NULL,
  text        TEXT         NOT NULL,
  reply_to    INT(11),
  post_date   DATETIME     NOT NULL,
  reply_count INT(4)       NOT NULL,
  PRIMARY KEY (id)
);

-- テスト用データ
INSERT INTO news (id, title, text, reply_to, post_date, reply_count)
VALUES
  (NULL, 'タイトル1', 'テキスト1', NULL, '2016-12-14T12:00:00.000', 3),
  (NULL, 'タイトル1についての返信1', 'テキスト1についての返信1', 1, '2016-12-14T12:00:00.000', 0),
  (NULL, 'タイトル1についての返信2', 'テキスト1についての返信2', 1, '2016-12-14T12:00:00.000', 0),
  (NULL, 'タイトル1についての返信3', 'テキスト1についての返信3', 1, '2016-12-14T12:00:00.000', 0),
  (NULL, 'タイトル2', 'テキスト2', NULL, '2016-12-14T12:00:00.000', 0),
  (NULL, 'タイトル3', 'テキスト3', NULL, '2016-12-14T12:00:00.000', 0),
  (NULL, 'タイトル4', 'テキスト4', NULL, '2016-12-14T12:00:00.000', 0),
  (NULL, 'タイトル5', 'テキスト5', NULL, '2016-12-14T12:00:00.000', 0);