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
          <script type="text/javascript" src="/lobby.bundle.js"></script>
        </body>
      </html>
    );
  }
}

module.exports = Content;