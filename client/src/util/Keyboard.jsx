import React from "react"

export const Key = {
  W: 87
  , D: 68
  , A: 65
  , S: 83
  , SPACE: 32
};

export class GlobalKeyboard extends React.PureComponent {
  constructor() {
    super();
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  installEvents() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keypress', this.onKeyPress);
    document.removeEventListener('keyup', this.onKeyUp);
    if (this.props.onKeyDown) {
      document.addEventListener('keydown', this.onKeyDown);
    }
    if (this.props.onKeyPress) {
      document.addEventListener('keypress', this.onKeyPress);
    }
    if (this.props.onKeyUp) {
      document.addEventListener('keyup', this.onKeyUp);
    }
  }

  uninstallEvents() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keypress', this.onKeyPress);
    document.removeEventListener('keyup', this.onKeyUp);
  }

  componentDidMount() {
    this.installEvents();
  }

  componentDidUpdate() {
    this.installEvents();
  }

  componentWillUnmount() {
    this.uninstallEvents();
  }

  onKeyDown(e) {
    this.props.onKeyDown(e);
  }

  onKeyPress(e) {
    this.props.onKeyPress(e);
  }

  onKeyUp(e) {
    this.props.onKeyUp(e);
  }

  render() {
    return null;
  }
}

export default GlobalKeyboard;