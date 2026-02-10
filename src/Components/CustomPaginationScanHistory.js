import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { createStyles } from '../assets/style/createStyles';
var styles = BuildStyleOverwrite(Styles);

const CustomPaginationScanHistory = (props) => {
    const [isLastItemVisible, setIsLastItemVisible] = useState(false);
    const [paginationArray, setPaginationArray] = useState([]);
    // const [currentIndex, setCurrentIndex] = useState(props.selectedIndex);
    const [currentIndex, setCurrentIndex] = useState(props.selectedIndex || 0);
    const listRef = useRef(null);
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    useEffect(() => {
        let newArray = Array(props.itemsPerPage).fill({});
        setPaginationArray(newArray);
        console.log('Pagination array updated:', newArray);
    }, [props.itemsPerPage]);

    const onPressPageItem = (index) => {
        console.log('Page item pressed:', index);
        setCurrentIndex(index + 1);
        props.onpressIndexClicked(index + 1);
    };

    const onPressPreviousIndex = () => {
        // if (currentIndex > 1) {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            // listRef.current.scrollToIndex({ animated: true, index: newIndex });
            props.onpressIndexClicked(newIndex);
        }
    };

    const onPressNextIndex = () => {
        // if (currentIndex < paginationArray.length) {
        if (currentIndex < props.itemsPerPage - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            // listRef.current.scrollToIndex({ animated: true, index: newIndex});
            props.onpressIndexClicked(newIndex);
        }
    };

    const renderPageItem = ({ item, index }) => (
        <View style={[{ borderRadius: 25, borderWidth: 0.5, borderColor: Colors.very_light_grey, padding: 5, margin: 5, height: 30, width: 30, backgroundColor: currentIndex == index ? props.itemBackgroundColor : Colors.white }]}>
            <TouchableOpacity style={[{ height: '100%', width: '100%' }]}
                onPress={() => {
                    setCurrentIndex(index);
                    props.onpressIndexClicked(index);
                }}>
                <Text style={[{ textAlign: 'center', color: currentIndex == index ? Colors.white : Colors.black }, styles['font_size_12_semibold']]}>{index + 1}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[ styles['border_radius_normal'], { height: props.pgHeight, width: props.pgWidth }]}>
            {paginationArray.length > 0 &&
                <View style={[styles['flex_direction_row'], styles['centerItems'], styles['width_100%'], styles['bg_lightgray'], styles['border_radius_normal']]}>
                    <TouchableOpacity style={[ styles['centerItems'], { height: '100%',width:"10%" }]} onPress={onPressPreviousIndex}>
                        <Image source={require('../assets/images/ic_forward.png')} style={[styles['width_height_10'], styles['align_self_center'], styles['margin_left_10'], { tintColor: Colors.black, transform: [{ scaleX: -1 }] }]} />
                    </TouchableOpacity>
                    <View style={[{ height: '100%', width: '80%' }, styles['centerItems']]}>
                        <FlatList
                            data={paginationArray}
                            horizontal={true}
                            renderItem={renderPageItem}
                            keyExtractor={(item, index) => index.toString()}
                            ref={listRef}
                            extraData={currentIndex}
                            style={[{ alignSelf: 'flex-start', height: '100%', width: '100%' }]}
                        />
                    </View>
                    <TouchableOpacity style={[ styles['centerItems'], { height: '100%',width:"10%" }]} onPress={onPressNextIndex}>
                        <Image source={require('../assets/images/ic_forward.png')} style={[styles['width_height_10'], styles['align_self_center'], { tintColor: Colors.black }]} />
                    </TouchableOpacity>
                </View>
            }
        </View>
    );
};

export default CustomPaginationScanHistory;
