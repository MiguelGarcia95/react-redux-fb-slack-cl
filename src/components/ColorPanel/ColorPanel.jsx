import React from 'react';
import {Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment} from 'semantic-ui-react';
import {SliderPicker} from 'react-color';
import firebase from '../../firebase';

class ColorPanel extends React.Component {
  state = {
    modal: false,
    primary: '',
    secondary: '',
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users')
  }

  handleSaveColors = () => {
    if (this.state.primary && this.state.secondary) {
      this.saveColors(this.state.primary, this.state.secondary)
    }
  }

  saveColors = (primary, secondary) => {
    this.state.usersRef
      .child(`${this.state.user.uid}/colors`)
      .push()
      .update({
        primary: primary, 
        secondary: secondary
      })
      .then(() => {
        console.log('colors added');
        this.closeModal();
      }).catch(err => console.error(err));
  }

  openModal = () => this.setState({modal: true})
  closeModal = () => this.setState({modal: false})

  handleChangePriamry = color => this.setState({primary: color.hex});
  handleChangeSecondary = color => this.setState({secondary: color.hex});

  render () {
    const {modal, primary, secondary} = this.state;

    return (
      <Sidebar
        as={Menu}
        icon='labeled'
        inverted
        vertical
        visible
        width='very thin'
      >
        <Divider />
        <Button icon='add' size='small' color='blue' onClick={this.openModal} />

        {/* Color Picker Modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <Label content='Primary Color' />
              <SliderPicker color={primary} onChange={this.handleChangePriamry} styles={{ default: { wrap: {} } }}  />
            </Segment>
            <Segment inverted>
              <Label content='Secondary Color' />
              <SliderPicker color={secondary} onChange={this.handleChangeSecondary} styles={{ default: { wrap: {} } }}  />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={this.handleSaveColors} color='green' inverted><Icon name='checkmark' /> Save Colors</Button>
            <Button onClick={this.closeModal} color='red' inverted><Icon name='remove' /> Cancel</Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    )
  }
}

export default ColorPanel;
