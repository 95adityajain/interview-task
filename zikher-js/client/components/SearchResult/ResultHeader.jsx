import React from 'react';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import Utility from '../../utility';



const CustomTH = ({
  curSortOrder,
  curSortField,
  changeSortOrder,
  heading,
  fieldIndex
}) => {
  const onClickHandler = function() {
    changeSortOrder(fieldIndex);
  };
  return (
    <th onClick={onClickHandler}>
      <div>
        {heading.toUpperCase()}
        {
          (curSortField === fieldIndex) ? 
          <Glyphicon glyph={(curSortOrder === 'A' ? 'chevron-up' : 'chevron-down')} />
          : null
        }
      </div>
    </th>
  );
}

export default class ResultHeader extends React.Component{
  render() {
    const {
      searchType,
      curSortOrder,
      curSortField,
      changeSortOrder
    } = this.props;

    const numColumns = Utility.getColumnCount(searchType);
    const elems = [];
    for(let i=0; i<numColumns; i++) {
      const fieldName = Utility.getFieldName(searchType, i);
      elems.push(
        <CustomTH
          key={fieldName}
          heading={fieldName}
          fieldIndex={i}
          curSortOrder={curSortOrder}
          curSortField={curSortField}
          changeSortOrder={changeSortOrder}
        />
      );
    }
    return (
      <tr>
        {elems}
      </tr>
    );
  }
}
