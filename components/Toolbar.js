import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Image } from 'react-native';
import PropTypes from 'prop-types';

export default class Toolbar extends React.Component {
  static propTypes = {
    isFocused: PropTypes.bool.isRequired,
    onChangeFocus: PropTypes.func,
    onSubmit: PropTypes.func,
    onPressCamera: PropTypes.func,
    onPressLocation: PropTypes.func,
  };

  static defaultProps = {
    onChangeFocus: () => {},
    onSubmit: () => {},
    onPressCamera: () => {},
    onPressLocation: () => {},
  };

  state = { text: '' };

  input = null; // Reference for the TextInput element

  // Set the ref to TextInput
  setInputRef = (ref) => {
    this.input = ref;
  };

  // Handle text change in the input field
  handleChangeText = (text) => this.setState({ text });

  // Handle submit of text, sending the message and clearing the input
  handleSubmitEditing = () => {
    const { onSubmit } = this.props;
    const { text } = this.state;
    if (!text) return;
    onSubmit(text);  // Submit the message
    this.setState({ text: '' });  // Clear the input after submission
  };

  // Focus the input field if isFocused changes to true
  componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused) {
      if (this.props.isFocused) {
        this.input.focus();
      } else {
        this.input.blur();
      }
    }
  }

  // Handle focus and blur actions when the input field gains or loses focus
  handleFocus = () => {
    const { onChangeFocus } = this.props;
    onChangeFocus(true);
  };

  handleBlur = () => {
    const { onChangeFocus } = this.props;
    onChangeFocus(false);
  };

  render() {
    const { onPressCamera, onPressLocation } = this.props;
    const { text } = this.state;

    return (
      <View style={styles.toolbar}>
        {/* Camera button as an image */}
        <TouchableOpacity style={styles.cameraButton} onPress={onPressCamera}>
          <Image
            source={require("../../assets/images/camera.jpg")}  // Correct path to camera.jpg
            style={styles.buttonIcon}
          />
        </TouchableOpacity>

        {/* Location button as an image */}
        <TouchableOpacity style={styles.locationButton} onPress={onPressLocation}>
          <Image
            source={require("../../assets/images/icon.png")}  // Correct path to icon.png
            style={styles.buttonIcon}
          />
        </TouchableOpacity>

        {/* Text Input for message */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={text}
            onChangeText={this.handleChangeText}
            onSubmitEditing={this.handleSubmitEditing}
            ref={this.setInputRef} // Set the ref for the TextInput
            onFocus={this.handleFocus} // Focus handler
            onBlur={this.handleBlur} // Blur handler
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingLeft: 16,
    backgroundColor: 'white',
  },
  cameraButton: {
    marginRight: 10,
  },
  locationButton: {
    marginRight: 10,
  },
  buttonIcon: {
    width: 30,  // Size of the image
    height: 30, // Size of the image
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    borderRadius: 16,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  input: {
    flex: 1,
    fontSize: 18,
  },
});
