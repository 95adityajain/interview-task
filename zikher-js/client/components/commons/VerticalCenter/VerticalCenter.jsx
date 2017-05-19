import React from 'react';
import PropTypes from 'prop-types';

import VerticalCenterCss from './VerticalCenter.css';



export default class VerticalCenter extends React.Component{
  render() {
    let classes = "verticalcenter";
    if(this.props.on === false) {
      classes = "";
    }
    return (
      <div className={classes}>
        { this.props.children }
      </div>
    );
  }
}

VerticalCenter.propTypes = {
  on: PropTypes.bool
};

VerticalCenter.defaultProps = {
  on: true
};
