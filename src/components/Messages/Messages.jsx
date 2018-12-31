import React from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import MessageHeader from './MessageHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';

class Messages extends React.Component {
  state = {
    messagesRef: firebase.database().ref('messages'),
    currentChannel: this.props.currentChannel,
    currentUser: this.props.currentUser
  }

  render () {
    const {messagesRef, currentChannel, currentUser} = this.state;
    return (
      <React.Fragment>
        <MessageHeader />

        <Segment>
          <Comment.Group className='messages'>
            {/* Messages */}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={currentChannel}
          currentUser={currentUser}
        />
      </React.Fragment>
    )
  }
}

export default Messages;
