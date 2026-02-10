import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { createStyles } from '../assets/style/createStyles';

var newStyles = BuildStyleOverwrite(Styles);


const CustomCircularProgress = ({ percentage = 75, radius = 30, strokeWidth = 6, percentageText = 95, level = 'High', strokeColor = '', hideStatus=false }) => {
    newStyles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
  const size = (radius + strokeWidth) * 2;
  const center = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={{ position: "absolute" }}>
        <Svg width={size} height={size}>
          <Circle
            stroke="#ccc"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            // stroke={strokeColor}
            stroke={strokeColor ||  (level == 'High' ? 'rgba(237, 50, 55, 1)' : level == 'Low' ? 'rgba(0, 135, 63, 1)' : 'rgba(255, 164, 18, 1)')}
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>
      </View>
      <View style={styles.textWrapper}>
        {/* <Text style={styles.text}>{`${percentageText}%`}</Text> */}
        {!hideStatus && <Text style={[styles.subText,newStyles['font_size_8_bold']]}>{level}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textWrapper: {
    // position: 'absolute',
    // top: '50%',
    // left: '50%',
    // transform: [{ translateX: -18 }, { translateY: -18 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  subText: {
    color: '#666',
  },

});

export default CustomCircularProgress;

