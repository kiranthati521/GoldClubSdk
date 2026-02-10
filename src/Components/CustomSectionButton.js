import React, { useMemo } from 'react';
import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { Image } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { Colors } from '../assets/Utils/Color';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

const CustomSectionButton = ({ title, onPress, buttonBg, btnWidth, titleTextColor, textAlign, margin, isBoldText, sectionOpen, isFromFAQ, isHtml, btnHeight }) => {
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    function sanitizeHtml(htmlContent) {
        let sanitizedContent = htmlContent.replace(/<br\s*\/?>/gi, '');

        const regex = /(<p>.*?<\/p>)/g;
        const matches = [...sanitizedContent.matchAll(regex)];

        if (matches.length > 1) {
            sanitizedContent = sanitizedContent.replace(matches[1][0], '');
        }

        return sanitizedContent;
    }

    return (
        <View style={[buttonBg == 'transparent' ? undefined : margin == undefined ? styles['margin_10'] : margin, styles['centerItems'], { width: btnWidth, borderColor: Colors.very_light_grey, borderWidth: 0.50, borderRadius: 8, height: btnHeight != undefined ? btnHeight : 45 }]}>
            <TouchableOpacity style={[styles['height_100%'], btnWidth != undefined ? styles['width_100%'] : styles['width_95%'], styles['border_radius_8'], { flexDirection: "row", alignItems: "center" }, styles['align_self_center'], (buttonBg == 'white' ? (sectionOpen == true ? undefined : styles['shadow_box']) : undefined), { backgroundColor: buttonBg }]} onPress={onPress}>
                {/* <ScrollView contentContainerStyle={styles.scrollViewContent}> */}
                {!isHtml &&
                    <Text style={[styles['width_85%'], styles['absolute_position'], [textAlign == 'left' ? undefined : styles['text_align_left'], buttonBg == 'transparent' ? undefined : styles['margin_10'], ((isBoldText != undefined && isBoldText) ? styles['font_size_16_semibold'] : styles['font_size_14_semibold']), { color: titleTextColor }]]}>{title}</Text>
                }
                <View style={[styles['width_85%'], styles['left_10']]}>
                    {(isHtml && title != "") &&
                        <RenderHTML
                            renderersProps={{
                                baseText: {
                                    style: { color: Colors.black },
                                },
                            }}
                            enableCSSInlineProcessing={true}
                            tagsStyles={{
                                p: { color: 'black'},
                                strong: { fontWeight: 600 }
                            }}
                            source={{ html: sanitizeHtml(title) }} />
                    }

                    {/* {title != " " &&
                        <RenderHTML
                            renderersProps={{
                                baseText: {
                                    style: { color: Colors.black },
                                },
                            }}
                            tagsStyles={{ p: { color: 'black' } }}
                            source={{ html: title }} />
                    } */}
                </View>
                {/* </ScrollView> */}
                <View style={[styles['right_10'], styles['align_items_flex_end'], styles['absolute_position']]}>
                    <Image
                        style={[{ tintColor: dynamicStyles.primaryColor }, { width: isFromFAQ ? 14 : 16, height: (Platform.OS == 'android') ? isFromFAQ ? 8 : 16 : (Platform.OS == 'android') ? 7 : isFromFAQ ? 7 : 15 }]}
                        source={(sectionOpen == true) ? (isFromFAQ == true ? require('../assets/images/redArrowUp.png') : require('../assets/images/sectionUpArrow.png')) : (isFromFAQ == true ? require('../assets/images/redArrowDown.png') : require('../assets/images/sectionDownArrow.png'))} />
                </View>

            </TouchableOpacity>
        </View>
    )
}

export default CustomSectionButton;