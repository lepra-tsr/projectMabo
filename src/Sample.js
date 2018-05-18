import React from 'react';

class Sample extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <p>{this.props.text}</p>
    );
  }
}

module.exports = Sample;