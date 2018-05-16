const React = require('react');

class Content extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <html>
        <head>
          <title>{this.props.title}</title>
        </head>
        <body>
          <h1>Express</h1>
          <p>here is {this.props.title}</p>
        </body>
      </html>
    );
  }
}

module.exports = Content;