import React from 'react';

import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import Panel from 'react-bootstrap/lib/Panel';

import CustomLoadingCss from './CustomLoading.css';


export default class CustomLoading extends React.Component {
  render() {
    return (
      <Panel className="panel-custom">
        <ProgressBar className="progress-bar-custom" active now={100} />
      </Panel>
    );
  }
}
