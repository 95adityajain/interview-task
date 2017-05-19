import React from 'react';

import Utility from '../../utility';



export default class ResultRow extends React.Component{
  render() {
    const {
      searchType,
      object
    } = this.props;

    const numColumns = Utility.getColumnCount(searchType);
    const elems = [];
    for(let i=0; i<numColumns; i++) {
      elems.push(
        <td key={i}>{Utility.getFieldValue(searchType, i, object) + ""}</td>
      );
    }

    return (
      <tr>
        {elems} 
      </tr>
    );
  }
}
