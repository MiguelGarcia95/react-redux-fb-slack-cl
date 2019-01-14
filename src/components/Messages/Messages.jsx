import React from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import MessageHeader from './MessageHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import firebase from '../../firebase';

class Messages extends React.Component {
  state = {
    messagesRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true,
    progressBar: false
  }

  componentDidMount() {
    const {channel, user} = this.state;
    if (channel && user) {
      this.addListeners(channel.id);
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  }

  addMessageListener = channelId => {
    let loadedMessages = [];
    this.state.messagesRef.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      })
    });
  }

  displayMessages = messages => {
    return messages.length > 0 && messages.map(message => (
      <Message key={message.timestamp} message={message} user={this.state.user}/>
    ));
  }

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({progressBar: true})
    }
  }

  render () {
    const {messagesRef, channel, user, messages, progressBar} = this.state;
    return (
      <React.Fragment>
        <MessageHeader />

        <Segment>
          <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
        />
      </React.Fragment>
    )
  }
}

export default Messages;
