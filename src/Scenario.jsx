'use strict';

import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  getMuiTheme,
  lightBaseTheme
} from 'material-ui/styles';
import {
  AppBar,
  Drawer,
  DropDownMenu,
  FontIcon,
  IconButton,
  IconMenu,
  MenuItem,
  RaisedButton,
  Tab,
  Tabs,
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
    const rightDrawerOpen = false;
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
          <MyRnd name='chat' />
          <Tabs>
            <Tab label="Tab A" value="a">
              <div>
                <MyRnd name={'Map001'}/>
                <MyRnd name={'Map002'}/>
              </div>
            </Tab>
            <Tab label="Tab B" value="b">
              <div>
                <MyRnd name={'Map003'}/>
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

class MyRnd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: '200px',
      height: '200px',
      x: 300,
      y: 300,
    };
  }

  render() {
    const style = {
      rnd: {
        backgroundColor: 'gray'
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
    console.log(e); // @DELETEME
    this.setState({ x: d.x, y: d.y });
  }
}

module.exports = Scenario;