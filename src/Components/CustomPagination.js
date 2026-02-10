import React, { Component, useMemo } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, AppState, Appearance, Keyboard, Platform, FlatList } from 'react-native';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { strings } from '../strings/strings';
import { createStyles } from '../assets/style/createStyles';



var styles = BuildStyleOverwrite(Styles);

export default class CustomPagination extends Component {
    constructor(props) {
        super(props)
        styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);

        this.state = {
            isLastItemVisible: false,
            pageItemArray: this.props.pageItemArray,
            pageFilteredArray: [],
            paginationArray: [],
            currentIndex: this.props.selectedIndex,
            itemsPerPage: this.props.itemsPerPage,
            itemBackgroundColor: this.props.itemBackgroundColor,

        }
    }


    componentDidMount() {
        const { itemsPerPage } = this.props;
        let newArray = [];
        for (let i = 0; i < itemsPerPage; i++) {
            newArray.push({});
        }
        this.setState({
            paginationArray: newArray,
        });
        console.log('84168864', newArray)
    }
    onPressPageItem(index) {
        var subArray = [];
        for (let i = 0; i < this.state.paginationArray.length; i++) {
            var object = this.state.paginationArray[i];
            object.enabled = false
            let indexedInt = parseInt(index);
            if (indexedInt == i) {
                object.enabled = true
            }
            subArray.push(object);
        }
        let indexedInt = parseInt(index);
        this.setState({
            currentIndex: indexedInt,
        })

        // this.props.onpressIndexClicked(indexedInt);


        //let indexedInt = parseInt(index);
        //alert(indexedInt)

        //  let indexedInt = parseInt(index);
        //  let filteredArray = [...this.props.pageItemArray];
        //  var tempArray = [];
        //  let fromIndex = indexedInt - 1;
        //  let fIndex = index == "1" ?  indexedInt - 1 : (indexedInt - 1) * 3;
        //  alert(indexedInt);

        //  this.setState({
        //     pageFilteredArray: []
        //  })

        //  let toIndex = indexedInt * 3 - 1;
        // console.log("temp object values",fromIndex, toIndex);
        //  for (let i = fIndex; i <= toIndex; i++) {

        //          var tempObject = filteredArray[i];
        //          tempArray.push(tempObject);
        //          console.log("temp length",tempArray);

        //  }
        //  setTimeout(() => {
        //     // alert(tempArray.length);
        //  this.setState({
        //     pageFilteredArray: tempArray
        //  })
        //  }, 200);

    }
    onPressPreviousIndex(index) {

        // let tempIndex = index == 0 ? index : index - 1;
        this.listRef.scrollToIndex({ animated: false, index: index == 0 ? 1 : index - 1 })
        this.props.onpressIndexClicked(index);
        // this.onPressPageItem(tempIndex.toString())
    }
    onPressNextIndex(index) {
        // let tempIndex = this.props.selectedIndex == this.state.paginationArray.length ? index : index + 1;
        this.listRef.scrollToIndex({ animated: false, index: index == 0 ? 1 : index - 1 });
        this.props.onpressIndexClicked(index);
        // this.onPressPageItem(tempIndex.toString())
    }

    _verticallistItem(item, index) {
        return (
            <View style={[styles['bg_white'], styles['shadow_box'], styles['border_radius_normal'], styles['margin_5'], { height: 100, width: Dimensions.get('window').width }]}>
                <TouchableOpacity style={[styles['align_self_center'], styles['flex_direction_row'], styles['width_95%'], styles['height_100%'], styles['centerItems']]} onPress={() => { this.props.onPressMoreItem(this.props.item) }}>
                    {!item.isCropSelection && <Image source={item.image} style={[styles['width_height_40'], { tintColor: Colors.light_tint_green }]} />}
                    {item.isCropSelection && <Image source={{ uri: item.cropImageUrl }} style={[styles['width_height_40'], { tintColor: Colors.light_tint_green }]} />}
                    <Text allowFontScaling={false} style={[styles['width_80%'], styles['top_10'], styles['text_align_center'], styles['margin_5'], styles['default_font_size'], styles['text_color_black']]}>
                        {item.title == undefined ? item.name : item.title}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
    _paginglistItem(item, index) {
        let indexed = index;
        let indexString = indexed.toString()
        console.log(item)

        return (
            <View style={[this.props.selectedIndex == index + 1 ? { backgroundColor: this.state.itemBackgroundColor } : styles['bg_white'], { borderRadius: 50 }, styles['margin_5'], { height: 40, width: 40 }]}>
                <TouchableOpacity style={[styles['align_self_center'], styles['flex_direction_row'], styles['width_95%'], styles['height_100%'], styles['centerItems']]} onPress={() => { this.props.onpressIndexClicked(index + 1); }}>
                    <Text allowFontScaling={false} style={[styles['width_80%'], styles['text_align_center'], styles['margin_5'], styles['default_font_size'], this.props.selectedIndex == index + 1 ? styles['text_color_white'] : styles['text_color_black']]}>
                        {index + 1}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    onViewableItemsChanged = ({ viewableItems, changed }) => {
        const { data } = this.props;
        const lastItemIndex = this.state.paginationArray.length - 1;
        const lastItemInViewableItems = viewableItems.find(
            item => item.index === lastItemIndex
        );

        this.setState({ isLastItemVisible: !!lastItemInViewableItems });
    };

    render() {
        const { PROP } = this.props;
        return (
            <View style={[styles['top_5'], styles['border_radius_normal'], { height: this.props.pgHeight, width: this.props.pgWidth }]}>

                {/* <FlatList
                    data={this.state.pageFilteredArray}
                    renderItem={({ item, index }) => this._verticallistItem(item, index)}
                    keyExtractor={(item, index) => index.toString()}
                    style={[styles['border_radius_normal'], { marginBottom: 175, paddingLeft: 5, width: '100%' }]}

                    scrollEnabled={true}
                >
                </FlatList> */}
                <View style={[styles['flex_direction_row'], styles['centerItems'], styles['width_95%'], styles['bg_lightgray'], styles['border_radius_normal'],]}>

                    <TouchableOpacity style={[styles['left_10'], styles['centerItems'], { width: 45, height: 45 }]} onPress={() => { if (this.props.selectedIndex != 1) { this.onPressPreviousIndex(this.props.selectedIndex - 1) } }}>
                        <Image style={[{ width: 15, height: 15 }, styles['top_3'], { resizeMode: 'contain' }, this.props.selectedIndex != 0 ? styles['tint_color_greenlight'] : styles['tint_color_grey']]} source={require('../assets/images/paginationLeft.png')}></Image>
                    </TouchableOpacity>
                    <View style={[styles['centerItems'], styles['flex_direction_row'], { width: '80%', height: 45, }]}>
                        <FlatList
                            data={this.state.paginationArray}
                            pagingEnabled={true}
                            horizontal={true}
                            renderItem={({ item, index }) => this._paginglistItem(item, index)}
                            keyExtractor={(item, index) => index.toString()}
                            style={[styles['border_radius_normal'],]}
                            ref={(ref) => { this.listRef = ref; }}
                            scrollEnabled={true}
                            extraData={this.state}
                            onViewableItemsChanged={this.onViewableItemsChanged}

                        >
                        </FlatList>
                        {!this.state.isLastItemVisible &&
                            <Text allowFontScaling={false} style={[styles['default_font_size'], styles['text_color_black']]}>
                                ...
                            </Text>
                        }
                    </View>
                    <TouchableOpacity style={[styles['centerItems'], styles['right_10'], { width: 45, height: 45 }]} onPress={() => { if (this.props.selectedIndex != this.state.paginationArray.length) { this.onPressNextIndex(this.props.selectedIndex + 1) } }}>
                        <Image style={[{ width: 15, height: 15 }, styles['top_3'], { resizeMode: 'contain' }, (this.props.selectedIndex == this.state.paginationArray.length - 1) ? styles['tint_color_grey'] : styles['tint_color_greenlight']]} source={require('../assets/images/paginationRight.png')}></Image>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    async onPressCheckBox(res) {
        this.props.onPressCheckBox(res)
    }

}