import React from 'react';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import ResultHeader from './ResultHeader';
import ResultRow from './ResultRow';

import SearchResultCss from './SearchResult.css';


export default class SearchResult extends React.Component{
  render() {
    const {
      searchType,
      filteredData,
      curSortField,
      curSortOrder,
      changeSortOrder
    } = this.props;

    if(!filteredData) {
      return null;
    }
    //console.log("will render", filteredData);
    const elems = filteredData.map((obj, index) => {
      return (
        <ResultRow
          key={index}
          searchType={searchType}
          object={obj}
        />
      );
    }); 

    return (
      <Grid fluid>
        <Row>
          <Col md={12}>
            <Table striped bordered hover>
              <thead>
                <ResultHeader
                  searchType={searchType}
                  curSortOrder={curSortOrder}
                  curSortField={curSortField}
                  changeSortOrder={changeSortOrder}
                />
              </thead>
              <tbody>
                {elems}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Grid>
    );
  }
}
