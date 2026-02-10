import React, { Component, useMemo } from 'react';
import {
  Text,
  View,
  Modal,
  Dimensions,
  Image,
  // ActivityIndicator
} from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { createStyles } from '../assets/style/createStyles';

const { height, width } = Dimensions.get('window')
var styles = BuildStyleOverwrite(Styles);

const CustomErrorLoader = props => {
  const {
    loading,
    message,
    ...attributes
  } = props;
  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  console.log("message", message);
  return (
    <Modal
      supportedOrientations={['portrait', 'landscape']}
      transparent={true}
      animationType='fade'
      visible={loading}
      onRequestClose={() => { console.log('close modal') }}>
      <View style={[styles['justify_content_center'], { backgroundColor: "#000000d6", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center" }]}>
        <Image source={require("../assets/images/error_animation.gif")} style={[styles['justify_content_center'], styles['align_self_center'], styles['center_align_items'], { width: 150, height: 150 }]} resizeMode={'contain'} />
        <Text style={[styles['font_size_13_regular'], styles['textAlignCenter'], styles['padding_left_10'], styles['top_10'], styles['text_color_white'], styles['text_input']]}>
          {message}
        </Text>

      </View>

    </Modal>
  )
}

export default CustomErrorLoader;
