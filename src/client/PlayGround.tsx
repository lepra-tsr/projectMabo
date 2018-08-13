"use strict";
import * as React from "react";

export class PlayGround extends React.Component<{}, {}> {
  static instance?: PlayGround;
  constructor(props) {
    super(props);

    if (typeof PlayGround.instance === 'object') {
      return PlayGround.instance;
    }
    PlayGround.instance = this;
  }

  render() {
    return (
      <div style={{backgroundColor:'dimgray'}}>
        playGround
      </div>
    )
  }
}
