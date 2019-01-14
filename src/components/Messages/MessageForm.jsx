import React from 'react';
import {Segment, Button, Input} from 'semantic-ui-react';
import firebase from '../../firebase';

class MessageForm extends React.Component {
  state = {
    message: '',
    loading: false,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    errors: [],
    modal: false
  }

  openModal = () => this.setState({modal: true})
  closeModal = () => this.setState({modal: false})

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  }

  createMessage = () => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
      },
      content: this.state.message
    }

    return message;
  }

  sendMessage = () => {
    const {messagesRef} = this.props;
    const {message, channel} = this.state;

    if (message) {
      this.setState({loading: true})
      messagesRef.child(channel.id).push().set(this.createMessage()).then(() => {
        this.setState({loading: false, message: '', errors: [] })
      }).catch(err => {
        console.error(err);
        this.setState({
          loading: false,
          errors: this.state.errors.concat({message: err.message})
        });
      })
    } else {
      this.setState({
        errors: this.state.errors.concat({message: 'Add a message'})
      });
    }
  }

  render () {
    const {errors, message, loading, modal} = this.state;
    return (
      <Segment className='message__form'>
        <Input
          fluid
          name='message'
          onChange={this.handleChange}
          style={{marginBottom: '0.7em'}}
          label={<Button icon={'add'} />}
          labelPosition='left'
          value={message}
          className={
            errors.some(error => error.message.includes('message')) ? 'error' : ''
          }
          placeholder='Write your message'
        />
        <Button.Group icon widths='2'>
          <Button
            onClick={this.sendMessage}
            color='orange'
            content='Add Reply'
            labelPosition='left'
            disabled={loading}
            icon='edit'
          />
          <Button
            color='teal'
            onClick={this.openModal}
            content='Upload Media'
            labelPosition='right'
            icon='cloud upload'
          />
          <FileModal
            modal={modal}
            closeModal={this.closeModal}
          />
        </Button.Group>
      </Segment>
    )
  }
}

export default MessageForm;
