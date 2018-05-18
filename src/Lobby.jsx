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
} from 'material-ui';
import {
  getMuiTheme,
  MuiThemeProvider,
  lightBaseTheme
} from 'material-ui/styles';
import ContentAdd from 'material-ui/svg-icons/content/add'

class Lobby extends React.Component {
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
      cardText: {
        height: '400px',
        overflow: 'scroll'
      },
      rightButton: {
        marginRight: '0px'
      },
    };

    const secondaryText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <Card style={style.card}>
          <CardTitle title="シナリオ一覧" subtitle="新しくシナリオを作成するか、シナリオにログインしましょう"/>
          <CardText style={style.cardText}>
            <List>
              <ListItem primaryText={'灯火の家'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'右手の塔'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'GHOST MACHINE'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'冷たい手'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'桐谷家の犬'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'桐谷家の犬'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'桐谷家の犬'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'桐谷家の犬'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'桐谷家の犬'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'桐谷家の犬'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'桐谷家の犬'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'桐谷家の犬'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
              <Divider inset={true}/>
              <ListItem primaryText={'桐谷家の犬'} insetChildren={true} secondaryTextLines={2} secondaryText={secondaryText}></ListItem>
            </List>
          </CardText>
          <CardActions>
            <FloatingActionButton mini={true}>
              <ContentAdd />
            </FloatingActionButton>
          </CardActions>
        </Card>
      </MuiThemeProvider>
    );
  }
}

module.exports = Lobby;