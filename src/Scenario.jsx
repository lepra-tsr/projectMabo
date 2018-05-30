'use strict';

import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  getMuiTheme,
  lightBaseTheme
} from 'material-ui/styles';
import {
  AppBar,
  AutoComplete,
  Drawer,
  DropDownMenu,
  FontIcon,
  IconButton,
  IconMenu,
  MenuItem,
  RaisedButton,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle
} from 'material-ui';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import Rnd from 'react-rnd';


class Scenario extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    const leftDrawerOpen = false;
    const rightDrawerOpen = true;
    const style = {
      main: {
        marginLeft: leftDrawerOpen ? '256px' : '10px',
        marginRight: rightDrawerOpen ? '256px' : '10px',
      },
      draggable: {
        height: '300px',
        width: '300px',
        backgroundColor: 'gray',
        wordBreak: 'break-word',
      },
      img: {
        height: '40px',
        width: '40px',
      },
      headline: {
        fontSize: 24,
        paddingTop: 16,
        marginBottom: 12,
        fontWeight: 400,
      },
    };
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div style={style.main}>
          <Toolbar>
            <ToolbarGroup firstChild={true}>
              <DropDownMenu value={true}>
                <MenuItem value={1} primaryText="All Broadcasts"/>
                <MenuItem value={2} primaryText="All Voice"/>
                <MenuItem value={3} primaryText="All Text"/>
                <MenuItem value={4} primaryText="Complete Voice"/>
                <MenuItem value={5} primaryText="Complete Text"/>
                <MenuItem value={6} primaryText="Active Voice"/>
                <MenuItem value={7} primaryText="Active Text"/>
              </DropDownMenu>
            </ToolbarGroup>
            <ToolbarGroup>
              <ToolbarTitle text="Options"/>
              <FontIcon className="muidocs-icon-custom-sort"/>
              <ToolbarSeparator/>
              <RaisedButton label="Create Broadcast" primary={true}/>
              <IconMenu
                iconButtonElement={
                  <IconButton touch={true}>
                    <NavigationExpandMoreIcon/>
                  </IconButton>
                }
              >
                <MenuItem primaryText="Download"/>
                <MenuItem primaryText="More Info"/>
              </IconMenu>
            </ToolbarGroup>
          </Toolbar>
          <ChatLog/>
          <ChatForm/>
          <Tabs>
            <Tab label="Tab A" value="a">
              <div>
                <MyRnd dragHandleClassName='.handle' name={'Map001'}/>
                <MyRnd dragHandleClassName='.handle' name={'Map002'}/>
              </div>
            </Tab>
            <Tab label="Tab B" value="b">
              <div>
                <MyRnd dragHandleClassName='.handle' name={'Map003'}/>
              </div>
            </Tab>
          </Tabs>
        </div>
        {(!leftDrawerOpen) && <div style={{ position: 'fixed', top: '0px', left: '0px', width: '10px', height: '100%', backgroundColor: 'gray' }}></div>}
        <Drawer open={leftDrawerOpen}>
          <MenuItem>Menu Item 1</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>
          <MenuItem>Menu Item 3</MenuItem>
          <MenuItem>Menu Item 4</MenuItem>
          <MenuItem>Menu Item 5</MenuItem>
          <MenuItem>Menu Item 6</MenuItem>
          <MenuItem>Menu Item 7</MenuItem>
          <MenuItem>Menu Item 8</MenuItem>
        </Drawer>
        {(!rightDrawerOpen) && <div style={{ position: 'fixed', top: '0px', right: '0px', width: '10px', height: '100%', backgroundColor: 'gray' }}></div>}
        <Drawer openSecondary={true} open={rightDrawerOpen}>
          <AppBar title=" AppBar"/>
        </Drawer>
      </MuiThemeProvider>
    );
  }
}


class ChatLog extends React.Component {
  render() {
    return (
      /* @TODO チャンネル */
      <Dialog dragHandleClassName='.handle' name='ログ' width={500} height={300} contents={this.renderLogs()}></Dialog>
    );
  }

  renderLogs() {
    const dummy = Array(100).fill({ player: '発言者:', content: '複素数体であれば、任意のCM-タイプの A は、実際、数体である定義体（英語版）(field of definition)を持っている。自己準同型環の可能なタイプは、対合（ロサチの対合（英語版）(Rosati involution）をもつ環として既に分類される。' });
    const style = {
      log: {
        fontSize: '9pt',
        height: '100%',
        overflowY: 'scroll'
      }
    };
    return (
      <div style={style.log}>
        {dummy.map((d, i) => (<span key={i}><span key={`player_${i}`}>{d.player}</span><span key={`content_${i}`}>{d.content}</span></span>))}
      </div>
    );
  }
}

class ChatForm extends React.Component {
  render() {
    return (
      <Dialog dragHandleClassName='.handle' name='入力フォーム' width={500} height={250} contents={this.renderForms()}></Dialog>
    );
  }

  renderForms() {
    const style = { contents: { height: '100%' } };

    return (
      <div style={style.contents}>
        <PlayerName/>
        <TextField hintText="チャンネル" fullWidth={false} multiLine={false}/>
        <TextField hintText="発言内容を入力しましょう" fullWidth={true} multiLine={true} rows={2} rowsMax={2}/>
        <OnType/>
      </div>
    );
  }
}

class OnType extends React.Component {
  render() {
    const users = Array(4).fill('').map((v, i) => `user_${i + 1}`).join(', ');
    return (
      <div>
        <span>{users}が入力中……</span>
      </div>
    );
  }
}


class PlayerName extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dataSource: [] };
  }

  render() {
    return (
      <AutoComplete
        hintText="発言者を指定しましょう"
        dataSource={this.state.dataSource}
        onUpdateInput={this.handleUpdateInput.bind(this)}
        floatingLabelText="発言者"
        fullWidth={false}
      />
    );
  }

  handleUpdateInput(value) {
    this.setState({
      dataSource: [
        value,
        `${value}様`,
        `${value}さん`,
      ]
    });
  }
}

class Dialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: this.props.width || '200px',
      height: this.props.height || '200px',
      x: !isNaN(parseInt(this.props.x)) ? parseInt(this.props.x) : 300,
      y: !isNaN(parseInt(this.props.y)) ? parseInt(this.props.y) : 300,
    };
  }

  render() {
    const style = {
      rnd: {
        backgroundColor: 'ghostwhite'
      },
      handle: { backgroundColor: 'lightsteelblue' },
      closeButton: { float: 'right', color: 'white' },
    };

    return (
      <Rnd
        dragHandleClassName={this.props.dragHandleClassName || '.handle'}
        style={style.rnd}
        size={{ width: this.state.width, height: this.state.height }}
        position={{ x: this.state.x, y: this.state.y }}
        onDragStop={this.onDragStop.bind(this)}
        onResize={this.onResize.bind(this)}
      >
        <div style={style.handle} className='handle'>
          <span>{this.props.name}</span>
          <span style={style.closeButton}>閉じる</span>
        </div>
        {this.props.contents}
      </Rnd>
    );
  }

  onResize(e, direction, ref, delta, position) {
    this.setState({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
  }

  onDragStop(e, d) {
    this.setState({ x: d.x, y: d.y });
  }
}

class MyRnd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: this.props.width || '200px',
      height: this.props.height || '200px',
      x: !isNaN(parseInt(this.props.x)) ? parseInt(this.props.x) : 300,
      y: !isNaN(parseInt(this.props.y)) ? parseInt(this.props.y) : 300,
    };
  }

  render() {
    const style = {
      rnd: {
        backgroundColor: 'ghostwhite'
      }
    };

    return (
      <Rnd
        style={style.rnd}
        size={{ width: this.state.width, height: this.state.height }}
        position={{ x: this.state.x, y: this.state.y }}
        onDragStop={this.onDragStop.bind(this)}
        onResize={this.onResize.bind(this)}
      >
        {this.props.name}
        {this.props.contents}
      </Rnd>
    );
  }

  onResize(e, direction, ref, delta, position) {
    this.setState({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
  }

  onDragStop(e, d) {
    this.setState({ x: d.x, y: d.y });
  }
}

module.exports = Scenario;