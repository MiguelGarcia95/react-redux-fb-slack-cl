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
    isChannelStarred: false,
    user: this.props.currentUser,
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    messages: [],
    messagesLoading: true,
    progressBar: false,
    numUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: []
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
    const ref = this.getMessagesRef();
    ref.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      })
      this.countUniqueUsers(loadedMessages)
    });
  }

  getMessagesRef = () => {
    const {messagesRef, privateMessagesRef, privateChannel} = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  }

  handleSearchChange = e => {
    this.setState({
      searchTerm: e.target.value,
      searchLoading: true
    }, () => this.handleSearchMessages());
  }

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, 'gi');
    const searchResults = channelMessages.reduce((acc, message) => {
      if (message.content && message.content.match(regex) || message.user.name.match(regex)) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({searchResults: searchResults});
    setTimeout(() => this.setState({searchLoading: false}), 1000)
    
  }

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name)
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 ? 'users' : 'user';
    const numUniqueUsers = `${uniqueUsers.length} ${plural}`;
    this.setState({numUniqueUsers: numUniqueUsers})
  }

  displayMessages = messages => {
    return messages.length > 0 && messages.map(message => (
      <Message key={message.timestamp} message={message} user={this.state.user}/>
    ));
  }

  handleStar = () => {
    this.setState(prevState => ({
      isChannelStarred: !prevState.isChannelStarred
    }), () => this.starChannel());
  }

  starChannel = () => {
    if (this.state.isChannelStarred) {
      console.log('star')
    } else {
      console.log('unstar')
    }
  }

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({progressBar: true})
    }
  }
  
  displayChannelName = channel => {
    return channel ? `${this.state.privateChannel ? '@' : '#'} ${channel.name}` : '';
  }

  render () {
    const {messagesRef, channel, user, messages, progressBar, numUniqueUsers, searchTerm, 
      searchResults, searchLoading, privateChannel, isChannelStarred} = this.state;
    return (
      <React.Fragment>
        <MessageHeader 
        channelName={this.displayChannelName(channel)} 
        handleSearchChange={this.handleSearchChange}
        users={numUniqueUsers} 
        searchLoading={searchLoading}
        isPrivateChannel={privateChannel}
        handleStar={this.handleStar}
        />

        <Segment>
          <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
            {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    )
  }
}

export default Messages;
