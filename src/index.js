import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route, withRouter} from 'react-router-dom';
import {Provider, connect} from 'react-redux';
import firebase from './firebase';
import 'semantic-ui-css/semantic.min.css'
import registerServiceWorker from './registerServiceWorker';

import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import store from './store';
import {setUser, clearUser} from './actions';
import Spinner from './Spinner';

class Root extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // console.log(user)
        this.props.setUser(user);
        //we are redirecting because '/' is where our chat will be
        this.props.history.push('/');
      } else {
        this.props.history.push('/login');
        this.props.clearUser();
      }
    })
  }
  render() {
    return this.props.isLoading ? <Spinner /> : (
        <Switch>
          <Route exact path='/' component={App} />
          <Route path='/login' component={Login} />
          <Route path='/register' component={Register} />
        </Switch>
    )
  }
}

const mapStateToProps = state => {
  return {
    isLoading: state.user.isLoading
  }
}

const RootWithAuth = withRouter(connect(mapStateToProps, {setUser, clearUser})(Root));

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();
