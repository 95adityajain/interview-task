import React from 'react';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Grid from 'react-bootstrap/lib/Grid';
import Alert from 'react-bootstrap/lib/Alert';

import CustomLoading from '../commons/CustomLoading/CustomLoading';



export default class SearchStatus extends React.Component {
  render() {
    const { loading, error } = this.props;
    if(!loading && !error) {
      return null;
    }
    return (
      <Grid>
        <Row>
          <Col xs={12} md={10} mdOffset={1}>
            { (loading)? <CustomLoading /> : null }
            { (error) ? 
              (<Alert bsStyle="danger">
                <h4><b>{ "Something went wrong! Try Again" }</b></h4>
              </Alert>) : null
            }
          </Col>
        </Row>
      </Grid>
    );
  }
};
