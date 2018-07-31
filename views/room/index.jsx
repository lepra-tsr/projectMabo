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
          <div id="container"></div>
          <p>roomId: {this.props.roomId}</p>
          <p>hash: {this.props.hash}</p>
          <script type="text/javascript" src="/client.bundle.js"></script>
        </body>
      </html>
    );
  }
}

module.exports = Content;