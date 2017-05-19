import React from 'react';
import Axios from 'axios';

import SearchBar from '../../components/SearchBar/SearchBar';
import SearchResult from '../../components/SearchResult/SearchResult';
import SearchStatus from '../../components/SearchStatus/SearchStatus';
import Utility from '../../utility';



export default class SearchContainer extends React.Component{
  constructor(props) {
    super(props);

    this.data = null;

    this.state = {
      searchBarDirty: false,
      searchValue: '',
      searchType: '',
      loading: false,
      error: false,
      filteredData: null,
      curSortField: null,
      curSortOrder: null
    };
    
    this.sendRequest = this.sendRequest.bind(this);
    this.changeSortOrder = this.changeSortOrder.bind(this);
  }

  changeSortOrder(sortFieldIndex) {
    let sortOrder = 'A';
    if(this.state.curSortField === sortFieldIndex && this.state.curSortOrder === 'A'){
      sortOrder = 'D';
    }

    const filteredData = this.data.slice();
    filteredData.sort((ob1, ob2) => {
      var sortVal = 0;
      const val1 = Utility.getFieldValue(this.state.searchType, sortFieldIndex, ob1);
      const val2 = Utility.getFieldValue(this.state.searchType, sortFieldIndex, ob2);
      if (val1 > val2) {
        sortVal = 1;
      }
      if (val1 < val2) {
        sortVal = -1;
      }
      if (sortOrder === 'D') {
        sortVal = sortVal * -1;
      }
      return sortVal;
    });

    this.setState({
      curSortOrder: sortOrder,
      curSortField: sortFieldIndex,
      filteredData
    });
  }

  sendRequest(searchValue, searchType) {
    this.data = null;
    this.setState({
      loading: true,
      error: false,
      searchBarDirty: true,
      filteredData: null,
      curSortField: null,
      curSortOrder: null,
      searchType: null,
      searchValue: null
    });
    Axios.get("https://api.spotify.com/v1/search", {
      params: {
        q: searchValue,
        type: searchType
      }
    }).then((res) => {
      console.log("result", res);
      const that = this;
      if(!res['data'] || 
        !res['data'][searchType+'s'] || 
        !res['data'][searchType+'s']['items']) {
        return Promise.reject("No data available");
      }
      setTimeout(function() {
        that.data = res['data'][searchType+'s']['items'];
        that.setState({
          error: false,
          loading: false,
          filteredData: that.data,
          searchType,
          searchValue
        });
      }, 250);
    }).catch((err) => {
      console.log("error", err);
      const that = this;
      setTimeout(function() {
        that.setState({
          error: true,
          loading: false,
          filteredData: null
        });
      }, 250);
    });
  }

  render() {
    return (
      <div>
        <SearchBar
          loading={this.state.loading}
          searchBarDirty={this.state.searchBarDirty}
          sendRequest={this.sendRequest} />

        <br /><br /><br />

        <SearchStatus {...this.state} />

        <SearchResult
          filteredData={this.state.filteredData}
          searchType={this.state.searchType}
          curSortField={this.state.curSortField}
          curSortOrder={this.state.curSortOrder}
          changeSortOrder={this.changeSortOrder} />
      </div>
    );
  }
}
