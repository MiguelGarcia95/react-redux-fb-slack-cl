import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';

class Login extends React.Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false
  }

  handleChange = (e) => this.setState({[e.target.name]: e.target.value});

  displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>)

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.isFormValid()) {
      this.setState({errors: [], loading: true});
    }
  }

  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : ''
  }

  render () {
    const {email, password, errors, loading} = this.state;
    return(
      <Grid textAlign='center' verticalAlign='middle' className='app'>
        <Grid.Column style={{maxWidth:450}}>
          <Header as='h1' icon color='violet' textAlign='center'>
            <Icon name='code branch' color='violet' />
            Login to DevChat
          </Header>
          <Form size='large' onSubmit={this.handleSubmit}>
            <Segment stacked>

              <Form.Input
                fluid
                name='email'
                icon='mail'
                iconPosition='left'
                placeholder='Email Address'
                onChange={this.handleChange}
                type='email'
                className={this.handleInputError(errors, 'email')}
                value={email}
              />

              <Form.Input
                fluid
                name='password'
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                onChange={this.handleChange}
                type='password'
                className={this.handleInputError(errors, 'password')}
                value={password}
              />

              <Button className={loading ? 'loading' : ''} color='violet' fluid size='large' disabled={loading}>
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>Not a user? <Link to='/register'>Register</Link></Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Login;
