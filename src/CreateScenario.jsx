'use strict';

import React from 'react';
import {
  AppBar,
  Card,
  CardHeader,
  RaisedButton,
  IconMenu,
  IconButton,
  MenuItem,
  CardTitle,
  CardText,
  CardActions,
  List,
  ListItem,
  Divider,
  FloatingActionButton,
  FlatButton,
  TextField,
} from 'material-ui';
import {
  getMuiTheme,
  MuiThemeProvider,
  lightBaseTheme
} from 'material-ui/styles';
import ContentAdd from 'material-ui/svg-icons/content/add';

class CreateScenario extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const style = {
      card: {
        marginTop: '200px',
        marginLeft: '20%',
        width: '60%'
      },
    };


    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <Card style={style.card}>
          <FlatButton label="一覧に戻る"/>
          <CardTitle title="シナリオ作成" subtitle="新しいシナリオの情報を入力してください"/>
          <CardText style={style.cardText}>
            <TextField
              hintText="シナリオ名を入力してください"
              floatingLabelText="シナリオ名"
            /><br />
            <TextField
              hintText="パスワードを入力してください"
              floatingLabelText="パスワード"
              type="password"
            /><br />
          </CardText>
          <CardActions>
            <FlatButton primary={true} label="作成してログイン"/>
          </CardActions>
        </Card>
      </MuiThemeProvider>
    );
  }
}

module.exports = CreateScenario;