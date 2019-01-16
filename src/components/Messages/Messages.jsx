import React from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setUserPosts} from '../../actions';
import MessageHeader from './MessageHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import Typing from './Typing';
import firebase from '../../firebase';

class Messages extends React.Component {
  state = {
    messagesRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    isChannelStarred: false,
    user: this.props.currentUser,
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    usersRef: firebase.database().ref('users'),
    typingRef: firebase.database().ref('typing'),
    connectedRef: firebase.database().ref('.info/connected'),
    messages: [],
    messagesLoading: true,
    progressBar: false,
    numUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    typingUsers: []
  }

  componentDidMount() {
    const {channel, user} = this.state;
    if (channel && user) {
      this.addListeners(channel.id);
      this.addUserStarsListeners(channel.id, user.uid)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.messagesEnd) {
      //should fix, only scroll when someone is done, not when someone is typing.
      // this.scrollToBottom();
      setTimeout(() => this.scrollToBottom(), 1)
    }
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({behavior: 'smooth'});
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
    this.addTypingListeners(channelId);
  }

  addTypingListeners = channelId => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on('child_added', snap => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        })
        this.setState({typingUsers: typingUsers})
      }
    })

    this.state.typingRef.child(channelId).on('child_removed', snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key)
      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key)
        this.setState({typingUsers: typingUsers})
      }
    })

    this.state.connectedRef.on('value', snap => {
      if (snap.val() === true) {
        this.state.typingRef
        .child(channelId)
        .child(this.state.user.uid)
        .onDisconnect()
        .remove(err => {
          if (err !== null) {
            console.error(err)
          }
        })
      }
    })
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
      this.countUserPosts(loadedMessages);
    });
  }

  addUserStarsListeners = (channelId, userId) => {
    this.state.usersRef
      .child(userId)
      .child('starred')
      .once('value')
      .then(data => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({isChannelStarred: prevStarred})
        }
      })
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
  
  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        }
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
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
      this.state.usersRef.child(`${this.state.user.uid}/starred`)
          .update({
            [this.state.channel.id]: {
              name: this.state.channel.name,
              details: this.state.channel.details,
              createdBy: {
                name: this.state.channel.createdBy.name,
                avatar: this.state.channel.createdBy.avatar
              }
            }
          })
    } else {
      this.state.usersRef.child(`${this.state.user.uid}/starred`)
          .child(this.state.channel.id)
          .remove(err => {
            if (err !== null) {
              console.error(err);
            }
          });
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

  displayTypingUsers = users => {
    if (users.length > 0) {
      return users.map(user => (
        <div key={user.id} style={{display: 'flex', alignItems: 'center', marginBottom: '0.2em'}}>
          <span className="user__typing">{user.name} is typing nonsense</span>  <Typing />
        </div>
      ))
    }
  }

  render () {
    const {messagesRef, channel, user, messages, progressBar, numUniqueUsers, searchTerm, 
      searchResults, searchLoading, privateChannel, isChannelStarred, typingUsers} = this.state;
    return (
      <React.Fragment>
        <MessageHeader 
        channelName={this.displayChannelName(channel)} 
        handleSearchChange={this.handleSearchChange}
        users={numUniqueUsers} 
        searchLoading={searchLoading}
        isPrivateChannel={privateChannel}
        handleStar={this.handleStar}
        isChannelStarred={isChannelStarred}
        />

        <Segment>
          <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
            {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div ref={node => this.messagesEnd = node}></div>
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

export default connect(null, {setUserPosts})(Messages);
