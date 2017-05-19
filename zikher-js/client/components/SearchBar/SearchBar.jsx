import React from 'react';

import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import VerticalCenter from '../commons/VerticalCenter/VerticalCenter';

import { SEARCH_TYPE } from '../../constants';

import SearchBarCss from './SearchBar.css';



const SearchBarHeader = () => {
  return (
    <Row>
      <Col md={3} mdOffset={1} sm={4} className="searchbar-header">
        SPOTIFY SEARCH
      </Col>
    </Row>
  );
};

const SearchBarBody = ({
  searchValue,
  searchType,
  loading,
  handleInputChange,
  sendRequest
}) => {
  return (
    <Row>
      <Col md={10} mdOffset={1} className="searchbar-form-container">
        <Form horizontal>
          <FormGroup>
          <Col md={7} sm={6}> 
            <FormControl
              type="text"
              className="searchbar-input"
              name="searchValue"
              value={searchValue}
              placeholder="Search Artist, Album, Playlist, Track..."
              onChange={handleInputChange}
              disabled={loading}
            />
          </Col>
          <Col md={4} sm={4}>
            <FormControl
              componentClass="select"
              className="searchbar-select"
              name="searchType"
              value={searchType}
              placeholder=""
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Select Search Type</option>
              <option value={SEARCH_TYPE.ARTIST}>Artist</option>
              <option value={SEARCH_TYPE.ALBUM}>Album</option>
              <option value={SEARCH_TYPE.TRACK}>Track</option>
              <option value={SEARCH_TYPE.PLAYLIST}>PlayList</option>
            </FormControl>
          </Col>
          <Col md={1} sm={2}>
            <Button bsStyle="info" bsSize="large" 
              disabled={!searchValue || !searchType || loading}
              onClick={() => {sendRequest(searchValue, searchType)}}
            >
              <Glyphicon glyph="search" />
            </Button>
          </Col>
          </FormGroup>
        </Form>
      </Col>
    </Row>
  );
};

export default class SearchBar extends React.Component{
  constructor(props) {
    super(props);

    this.state = {
      searchValue: '',
      searchType: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const name = event.target.name;
    this.setState({
      [name]: event.target.value
    });
  }

  render() {
    const {
      searchBarDirty,
      loading,
      sendRequest
    } = this.props;

    return (
      <VerticalCenter on={!searchBarDirty}>
        <Grid>
          {(!searchBarDirty) ? <SearchBarHeader /> : null}
          <SearchBarBody 
            loading={loading}
            handleInputChange={this.handleInputChange}
            sendRequest={sendRequest}
            searchValue={this.state.searchValue}
            searchType={this.state.searchType}
          />
        </Grid>
      </VerticalCenter>
    );
  }
}
