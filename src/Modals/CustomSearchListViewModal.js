
import React, { PureComponent, Component, useMemo, } from 'react';
import { View, Text, Modal, FlatList, Image, Platform, TouchableOpacity, AppState, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { strings } from '../strings/strings';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { HTTP_OK, configs } from '../helpers/URLConstants';
import { GetApiHeaders, PostRequest } from '../NetworkUtils/NetworkUtils';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';

var styles = BuildStyleOverwrite(Styles);

export default class CustomSearchListViewModal extends Component {
    constructor(props) {
        super(props);
        console.log('the propsss', props)
        styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
        AppState.addEventListener('change', this._handleAppStateChange);

        this.state = {
            listItems: this.props.listItems,
            search: "",
            filteredList: [],
            unFilteredDeputeeList: this.props.unFilteredDeputeeList,
            currentPage: 1,
            isLoading: false,
            isRefreshing: false,
        }
    }

    async componentDidMount() {
        if (this.props.dropDownType == translate('retailerName')) {
            this.loadMoreItems(true);
        }
    }

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
            this.setState({
                isActive: false,
            });
        }
    }


    onPressDropdownItem(item, index) {
        if (item.name == translate('no_data_available')) {
            return
        }
        if (this.props.dropDownType == translate('retailerName')) {
            this.props.onSelectedRetailerName(item)
        }
    }

    render_listItem(item, index) {
        return (
            <TouchableOpacity key={index.toString()} onPress={() => this.onPressDropdownItem(item, index)} >
                <View style={[styles['width_100%'], styles['top_10']]}>
                    {this.props.dropDownType != translate('switch_role') && <Text style={[styles['font_size_13_regular'], (this.props.selectedItem == item.name) ? styles['text_color_blue'] : styles['text_color_black'], styles['text_input'], styles['padding_5'], (item.name == translate('no_data_available') ? styles['textAlignCenter'] : styles['text_align_left'])]} allowFontScaling={true} numberOfLines={3}>
                        {this.props.dropDownType == translate('unit_size_uim') ? item.shortDisplay : item.name}
                    </Text>}
                </View>
                <View style={[styles['bg_light_grey_color'], styles['height_1'], styles['width_100%'], styles['centerItems'], styles['top_5']]}></View>

            </TouchableOpacity>
        )
    }

    async fetchItems(page, search) {
        this.setState({ isLoading: true });
        try {
            var getloginURL = configs.BASE_URL + configs.QRSCAN.RETAILERS_MASTERS;
            var getHeaders = await GetApiHeaders();

            var dataList = {
                "roleId": 10,
                "page": page,
                "search": search,
                zoneId: this.props.zoneId,
                regionId: this.props.regionId,
                territoryId: this.props.territoryId,
                hqId: this.props.hqId
            }
            var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
            console.log("APIResponse", APIResponse)
            if (APIResponse.statusCode == HTTP_OK) {

                // console.log('the dropdown Resp is111 :', APIResponse.response)
                if (page == 0 && search != "") {
                    this.setState({
                        filteredList: []
                    })
                }
                return APIResponse.response
            }
            else {
                return null;
            }
        } catch (error) {
            console.error(error);
            return [];
        } finally {
            this.setState({ isLoading: false });
        }
    }


    async filterList() {
        const items = await this.fetchItems(0, this.state.search);
        // array = [{ "id": 0, "name": translate('no_data_available') }]
        this.setState({
            filteredList: (items != undefined && items != null && items.length > 0) && items
        })
        // var listItems = this.props.dropDownType == translate('deputee_details') ? this.state.unFilteredDeputeeList : this.state.listItems;
        // var array = listItems.filter(data => data.name.toString().toLowerCase().includes(this.state.search.toLowerCase()));
        // if (array.length == 0) {
        //     array = [{ "avaliable": 0, "code": 0, "id": 0, "mainSiteId": 0, "minimumStockShouldBe": 0, "name": translate('no_data_available'), "parentCode": 0, "storeLocationId": 0, "subSiteId": 0, "subStoreLocatioId": 0 }]
        // }
        // this.setState({
        //     filteredList: array
        // })
    }

    async loadMoreItems(reset = false) {
        if (this.state.isLoading) return;

        const nextPage = reset ? 1 : this.state.currentPage;
        const search = this.state.search;

        const items = await this.fetchItems(nextPage, search);

        if (items != null) {
            this.setState(prevState => ({
                filteredList: reset ? items : [...prevState.filteredList, ...items],
                currentPage: nextPage + 1,
            }));
        }
    }

    render() {
        return (
            <Modal
                supportedOrientations={['portrait', 'landscape']}
                visible={this.props.visible} onRequestClose={this.props.onBackdropPress} animationType={'slide'}
                transparent={true} style={this.props.style}>

                <View style={[styles['width_100%'], styles['height_100%'], styles['transparent_black_bg'], styles['centerItems']]}>
                    <View style={[styles['width_85%'], styles['border_radius_normal'], styles['padding_10'], styles['margin_30'], styles['max_height_80%'], styles['bg_white'], (this.state.filteredList != undefined && this.state.filteredList.length > 3 ? styles['height_300'] : styles['height_200'])]}>
                        {/* <View style={[styles['flex_direction_row'], styles['width_100%']]}>
                            <Text style={[styles['text_color_black'], styles['font_size_16_semibold'], styles['padding_5'], styles['width_95%'], styles['text_align_center']]}>
                                {translate('select')}
                            </Text>
                        </View> */}

                        <TouchableOpacity style={[styles['width_height_20'], styles['right_5'], styles['absolute_position'], styles['top_5'], { alignSelf: 'flex-end' }]} onPress={this.props.closeModal}>
                            <Image source={require('../assets/images/close.png')} style={[styles['width_height_20'], { tintColor: 'red' }]} />
                        </TouchableOpacity>

                        <View style={[styles['flex_direction_row'], styles['centerItems'], styles['width_95%'], styles['bg_white'], styles['border_radius_normal'], styles['margin_20'], styles['button_height_45'], styles['border_width_1'], { borderColor: Colors.grey }]}>
                            <TextInput
                                value={this.state.search}
                                onChangeText={(search) => {
                                    this.setState({ search: search })
                                    setTimeout(() => {
                                        if (search == "") {
                                            this.setState({ search: '', filteredList: [] }
                                                , () => {
                                                    if (this.state.search == "") {
                                                        this.loadMoreItems(true);
                                                    }
                                                })
                                        } else {
                                            if (search.length > 3) {
                                                this.filterList()
                                            }
                                        }
                                    }, 100);
                                }}
                                color={Colors.black}
                                placeholder={'Search'}
                                style={[styles['padding_left_10'], styles['width_90%'], styles['font_size_14_regular'], styles['text_color_black'], styles['button_height_45']]} />
                            <TouchableOpacity style={[styles['centerItems']]}
                                onPress={() => {
                                    if (this.state.search != "") {
                                        Keyboard.dismiss()
                                    }
                                    this.setState({
                                        search: '', filteredList: []
                                    }, () => {
                                        if (this.state.search == "") {
                                            this.loadMoreItems(true);
                                        }
                                    })
                                }}>
                                <Image
                                    style={[styles['width_height_20'], styles['centerItems'], { tintColor: "#C0C1C1" }]}
                                    source={(this.state.search == '') ? require('../assets/images/search.png') : require('../assets/images/cancel.png')} />
                            </TouchableOpacity>

                        </View>

                        <FlatList
                            data={this.state.filteredList != undefined ? this.state.filteredList : []}
                            style={[styles['width_100%']]}
                            renderItem={({ item, index }) =>
                                this.render_listItem(item, index)
                            }
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item, index) => { index.toString() }}
                            nestedScrollEnabled
                            onEndReachedThreshold={0.1}
                            onEndReached={() => this.state.search == "" && (this.state.filteredList != undefined && this.state.filteredList.length > 4) && this.loadMoreItems()}
                            ListFooterComponent={(this.state.search == "" && this.state.isLoading) ?
                                // <ActivityIndicator size="large" color={Colors.blue} /> 
                                <View style={{ justifyContent: 'center', textAlign: 'center' }}>
                                    <ActivityIndicator
                                        color={Colors.blue}
                                        size='large'
                                        animated={false}
                                    />
                                    <Text style={[{ textAlign: 'center', color: Colors.black }]}>{"Loading..."}</Text>
                                </View>
                                : null}
                        >
                        </FlatList>
                    </View>
                </View>
            </Modal>
        );
    }
}