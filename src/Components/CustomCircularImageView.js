import React, { useMemo } from 'react';
import { Image, StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

const CustomCircularImageView = ({ source, size, onPressImageClick, borderRadius, height, badgeIcon,stylesOfBadge }) => {
        styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const imageSize = {
        width: size,
        height: size,
        borderRadius: size / 2,
    };

    return (
        <TouchableOpacity onPress={onPressImageClick}>
            <View style={[{ height: height != undefined ? height : 100, width: height != undefined ? height : 100, backgroundColor: Colors.white, borderRadius: 100, alignSelf: 'center' }]}>
                <View style={[styles['bg_white'], styles['height_100%'], borderRadius != undefined ? borderRadius : styles['border_width_1'], styles['border_radius_100'], styles['justify_content_center'], { width: '100%', borderColor: Colors.grey }]}>
                    <View style={[styles['align_self_center'], { overflow: 'hidden' }, imageSize]}>
                        {(source != null && source != undefined) && <Image source={source} style={imageSize} />}
                    </View>
                </View>
            </View>
            {badgeIcon !== '' && <Image source={{ uri: badgeIcon }} style={stylesOfBadge} />}
        </TouchableOpacity>
    );
};


export default CustomCircularImageView;
