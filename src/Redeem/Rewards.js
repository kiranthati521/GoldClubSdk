import React, { useEffect, useMemo, useState } from 'react';
import {View, Platform, StatusBar, Text, Image, Keyboard, TouchableOpacity, FlatList, ScrollView, TextInput, } from 'react-native';
import Dashboard from '../Dashboard/Dashboard';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { strings } from '../strings/strings';
import { Colors } from '../assets/Utils/Color';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';


var styles = BuildStyleOverwrite(Styles);

function Rewards() {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    return(
        <View style={[styles['padding_horizontal_35']]}>
        <View style={[styles['centerItems']]}><Text  style={[styles['text_color_black'],styles['font_size_24_bold'],]}>Rewards</Text>
        <View  style={[styles["border_bottom_width_2"],styles['bg_black'],styles[ 'margin_top_25']]} ></View>
        
        <View style={[styles['width_100%'],styles['bg_white'],styles['padding_14'],styles['flex_direction_row'],styles['border_radius_8'],styles['justify_content_space-between']]}>
        <Image style={[styles[''], styles['centerItems'],]}
                                source={ require('../assets/images/rewardProduct.png')} />
            <View>
            <Text style={[styles['text_color_black'],styles['font_size_18_bold']]}>Sugar Watchers Low GI Rice</Text>
        <Text style={[styles['text_color_black'],styles['margin_top_5']]}>Diabetic Friendly White Rice|0.5kg</Text>
        <Text style={[styles['text_color_black']]}>Registered Clinically Certified Low GI</Text>
        </View>
        </View>
        <View  style={[styles['width_100%'],styles['bg_white'],styles['padding_horizontal_90'],styles['border_radius_8'],styles['margin_top_20'],styles['centerItems']]}>
            <Text style={[styles['text_color_black'],styles['font_size_18_bold'],]}>UPI Transfer</Text>
            <Text style={[styles['text_color_black'],styles[''],]}>UPI-Transfer Rs.50000</Text>
        </View>
        </View>
        <View style={[styles['margin_top_20']]}>
            <Text  style={[styles['text_color_black'],]}>Points     : 10000</Text>
            <Text  style={[styles['text_color_black'],styles['margin_top_5']]}>SKU         : EL05765</Text>
            <Text  style={[styles['text_color_black'],styles['margin_top_5']]}>Category : Cash Transfer UPI Payment</Text>
           <View style={[styles['flex_direction_row'],styles['margin_top_15']]}><Text  style={[styles['text_color_black'],]}>Qty</Text><View style={[styles['bg_light_grey_color'],styles['margin_left_15'],styles['width_70'],styles['height_28'],styles['border_radius_15'],styles['flex_direction_row'],styles['space_between'],styles['padding_4']]}><View  style={[styles['bg_white'],styles['width_20'],styles['height_20'],styles['border_radius_50']]}><Text style={[styles['text_color_black'],styles['centerItems']]}>+</Text></View><Text style={[styles['text_color_black']]}>01</Text><View  style={[styles['bg_white'],styles['width_20'],styles['height_20'],styles['border_radius_50']]}><Text style={[styles['text_color_black'],styles['centerItems']]}>-</Text></View></View></View>
        </View>
       <View style={[styles['flex_direction_row'],styles['justify_content_space-between'],styles['margin_top_25']]}>
       <View style={[styles['width_40%'],]}>
                    <TouchableOpacity style={[styles['width_100%'], styles['border_radius_10'],styles['centerItems'],styles['button_height_45'], styles['bg_red'] ]} >
                        <Text style={[styles['font_size_14_semibold'],{ color: Colors.white }]}>
                            {translate('add_to_cart')}
                        </Text>
                    </TouchableOpacity>
                    </View>
                    <View style={[styles['width_40%']]}>
                    <TouchableOpacity style={[styles['width_100%'], styles['border_radius_10'],styles['centerItems'],styles['button_height_45'], styles['bg_red'] ]} >
                        <Text style={[styles['font_size_14_semibold'],{ color: Colors.white }]}>
                            {translate('redeem')}
                        </Text>
                    </TouchableOpacity>
                    </View>
       </View>
        </View>
        );
}
export default Rewards;
