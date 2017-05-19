import React from 'react';
import ReactDOM from 'react-dom';
import Bootstrap from 'bootstrap/dist/css/bootstrap.min.css';
import BootstrapTheme from 'bootstrap/dist/css/bootstrap-theme.min.css';

import SearchContainer from './containers/SearchContainer/SearchContainer';



class App extends React.Component{
  render() {
    return (
      <div>
        <SearchContainer />
      </div>
    );
  }
}

const render = () => {
  ReactDOM.render(
    <App />,
    document.getElementById('react-app'));
};
render();

/*store.subscribe(function() {
  console.log(store.getState());
})*/
