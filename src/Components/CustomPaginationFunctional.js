import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

const CustomPaginationFunctional = (props) => {
    const [isLastItemVisible, setIsLastItemVisible] = useState(false);
    const [paginationArray, setPaginationArray] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(props.selectedIndex);
    const listRef = useRef(null);
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    useEffect(() => {
        let newArray = Array(props.itemsPerPage).fill({});
        setPaginationArray(newArray);
        console.log('Pagination array updated:', newArray);
    }, [props.itemsPerPage]);

    useEffect(() => {
        setCurrentIndex(props.selectedIndex);
        if (listRef.current) {
            listRef.current.scrollToIndex({ animated: false, index: props.selectedIndex - 1 });
        }
    }, [props.selectedIndex]);

    const onPressPageItem = (index) => {
        console.log('Page item pressed:', index);
        setCurrentIndex(index + 1);
        props.onpressIndexClicked(index + 1);
    };

    const onPressPreviousIndex = () => {
        if (currentIndex > 1) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            listRef.current.scrollToIndex({ animated: true, index: newIndex - 1 });
            props.onpressIndexClicked(newIndex);
        }
    };

    const onPressNextIndex = () => {
        if (currentIndex < paginationArray.length) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            listRef.current.scrollToIndex({ animated: true, index: newIndex - 1 });
            props.onpressIndexClicked(newIndex);
        }
    };

    const renderPageItem = ({ item, index }) => (
        <View style={[currentIndex === index + 1 ? { backgroundColor: props.itemBackgroundColor } : styles['bg_white'], { borderRadius: 50 }, styles['margin_5'], { height: 40, width: 40 }]}>
            <TouchableOpacity style={[styles['align_self_center'], styles['flex_direction_row'], styles['width_95%'], styles['height_100%'], styles['centerItems']]} onPress={() => onPressPageItem(index)}>
                <Text allowFontScaling={false} style={[styles['width_80%'], styles['text_align_center'], styles['margin_5'], styles['default_font_size'], currentIndex === index + 1 ? styles['text_color_white'] : styles['text_color_black']]}>
                    {index + 1}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles['top_5'], styles['border_radius_normal'], { height: props.pgHeight, width: props.pgWidth }]}>
            {paginationArray.length > 0 &&
                <View style={[styles['flex_direction_row'], styles['centerItems'], styles['width_95%'], styles['bg_lightgray'], styles['border_radius_normal']]}>
                    <TouchableOpacity style={[styles['left_10'], styles['centerItems'], { width: 45, height: 45 }]} onPress={onPressPreviousIndex}>
                        <Image style={[{ width: 15, height: 15 }, styles['top_3'], { resizeMode: 'contain' }, currentIndex !== 1 ? styles['tint_color_greenlight'] : styles['tint_color_grey']]} source={require('../assets/images/paginationLeft.png')} />
                    </TouchableOpacity>
                    <View style={[styles['centerItems'], styles['flex_direction_row'], { width: '80%', height: 45 }]}>
                        <FlatList
                            data={paginationArray}
                            horizontal={true}
                            renderItem={renderPageItem}
                            keyExtractor={(item, index) => index.toString()}
                            style={[styles['border_radius_normal']]}
                            ref={listRef}
                            extraData={currentIndex}
                        />
                    </View>
                    <TouchableOpacity style={[styles['centerItems'], styles['right_10'], { width: 45, height: 45 }]} onPress={onPressNextIndex}>
                        <Image style={[{ width: 15, height: 15 }, styles['top_3'], { resizeMode: 'contain' }, currentIndex !== paginationArray.length ? styles['tint_color_greenlight'] : styles['tint_color_grey']]} source={require('../assets/images/paginationRight.png')} />
                    </TouchableOpacity>
                </View>
            }
        </View>
    );
};

export default CustomPaginationFunctional;
