import { Platform } from "react-native"
import { Colors } from "../Utils/Color"
import { FontForWeight, FontForWeightRaleway } from "../fonts/fonts"
  
export const Styles = {
    'border_color_white': {
        borderColor: Colors.white
    },
    'app_theme_bg_color': {
        backgroundColor: Colors.app_theme_color
    },
    'tint_color_white': {
        tintColor: Colors.white
    },
    'tint_color_black': {
        tintColor: Colors.black
    },
    'tint_color_blue': {
        tintColor: Colors.blue
    },
    'tint_color_mide_grey': {
        tintColor: Colors.mid_grey
    },
    'tint_color_red': {
        tintColor: Colors.themeRed
    },
    'theme_dark_bg': {
        backgroundColor: Colors.color1
    },
    'bg_white': {
        backgroundColor: Colors.white
    },
    'bg_grey': {
        backgroundColor: Colors.grey
    },
    'bg_white_grey': {
        backgroundColor: Colors.white_grey
    },
    'bg_light_grey': {
        backgroundColor: Colors.light_grey
    },
    'bg_green': {
        backgroundColor: Colors.green
    },
    'bg_green_points': {
        backgroundColor: Colors.greenPoints
    },
    'bg_red': {
        backgroundColor: Colors.red
    },
    'bg_greyish': {
        backgroundColor: Colors.greyish
    },
    'bg_lightish_grey': {
        backgroundColor: Colors.lightish_grey
    },
    'bg_grey_light': {
        backgroundColor: Colors.lightGray
    },
    'bg_lightish_black': {
        backgroundColor: Colors.lightish_black
    },
    'bg_lightwhiteGray': {
        backgroundColor: Colors.lightwhiteGray
    },
    'bg_light_grey_color': {
        backgroundColor: Colors.very_light_grey
    },
    'bg_black': {
        backgroundColor: Colors.black
    },
    'bg_themeRed': {
        backgroundColor: Colors.themeRed
    },
    'bg_Orange': {
        backgroundColor: Colors.buttonOrange
    },
    'imageUploadBgColor': {
        backgroundColor: Colors.imageUploadBackColor
    },
    'lightRedBgColor': {
        backgroundColor: Colors.lightRed
    },
    'cellBgColor': {
        backgroundColor: Colors.lightWhiteBlue
    },
    'text_color_black': {
        color: Colors.black
    },
    'text_color_white': {
        color: Colors.white
    },
    'text_color_grey': {
        color: Colors.grey
    },
    "text_color_mid_grey": {
        color: Colors.mid_grey
    },
    'text_color_green': {
        color: Colors.green
    },
    'text_color_orange': {
        color: Colors.buttonOrange
    },
    'text_color_blue': {
        color: Colors.blue
    },
    'text_color_red': {
        color: Colors.textRed
    },
    'full_screen': {
        width: '100%',
        height: '100%',
    },
    'align_self_center': {
        alignSelf: 'center'
    },
    'flex_direction_row': {
        flexDirection: 'row'
    },
    'flex_direction_column': {
        flexDirection: 'column'
    },
    'flexGrow_1': {
        flexGrow: 1
    },
    'align_self_flex_end': {
        alignSelf: 'flex-end'
    },
    'justify_content_center': {
        justifyContent: 'center',
    },
    'justify_content_flex_end': {
        justifyContent: 'flex-end',
    },
    'alignItems_center': {
        alignItems: 'center'
    },
    'alignSelf_end': {
        alignSelf: 'flex-end'
    },
    'height_30': {
        height: 30
    },
    'height_53': {
        height: 53
    },
    'margin_right_8': {
        marginRight: 8
    },
    'width_40%': {
        width: '40%'
    },
    'width_60%': {
        width: '60%'
    },
    'width_70%': {
        width: '70%'
    },
    'width_80%': {
        width: '80%'
    },
    'border_2': {
        borderWidth: 2.0,
    },
    'left_15': {
        marginLeft: 15
    },
    'flex_1': {
        flex: 1
    },
    'width_100%': {
        width: "100%"
    },
    'height_100%': {
        height: "100%"
    },
    'height_50%': {
        height: "50%"
    },
    'margin_top_50': {
        marginTop: 50
    },
    'margin_top_22': {
        marginTop: 22
    },
    'margin_top_25': {
        marginTop: 25
    },
    'margin_top_10%': {
        marginTop: "10%"
    },
    'margin_top_50%': {
        marginTop: "50%"
    },
    'bottom_25': {
        bottom: 25
    },
    'margin_left_5': {
        marginLeft: 5,
    },
    'left_10': {
        marginLeft: 10,
    },
    'width_25': {
        width: 25
    },
    'width_2' : {
        with : 2
    },
    'width_70': {
        width: 70
    },
    'width_90': {
        width: 90
    },
    'width_10': {
        width: 10
    },
    'height_20': {
        height: 20
    },
    'width_115': {
        width: 115
    },
    'height_125': {
        height: 125
    },
    'height_130': {
        height: 130
    },
    'height_200': {
        height: 200
    },
    'height_80': {
        height: 80
    },
    'height_83%': {
        height: '83%'
    },
    'width_height_25': {
        width: 25,
        height: 25,
    },
    'width_height_115': {
        width: 115,
        height: 115,
    },
    'width_height_150_185': {
        width: 150,
        height: 185,
    },
    'width_height_80': {
        width: 80,
        height: 80
    },
    'height_6%': {
        height: "6%"
    },
    'absolute_position': {
        position: 'absolute',
    },
    'top_35': {
        top: "35%"
    },
    'top_60': {
        top: "60%"
    },
    'top_70': {
        top: 70
    },
    'bottom_10': {
        bottom: 10
    },
    'bottom_15': {
        bottom: 15
    },
    'text_align_center': {
        textAlign: 'center'
    },
    'text_align_right': {
        textAlign: 'right'
    },
    'text_underline': {
        textDecorationLine: 'underline'
    },
    'centerItems': {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center'
    },
    'width_90%': {
        width: '90%'
    },
    'width_91%': {
        width: '91%'
    },
    'width_92%': {
        width: '92%'
    },
    'width_93%': {
        width: '93%'
    },
    'width_30%': {
        width: '30%'
    },
    'width_height_150_200': {
        width: 150,
        height: 200
    },
    'width_height_200': {
        width: 200,
        height: 200
    },
    'width_height_150': {
        width: 150,
        height: 150
    },
    'margin_top_30': {
        marginTop: 30
    },
    'margin_top_100': {
        marginTop: 100
    },
    'margin_left_20': {
        marginLeft: 20
    },
    'height_60': {
        height: 60
    },
    'height_70': {
        height: 70
    },
    'top_10': {
        marginTop: 10
    },
    'margin_top_20': {
        marginTop: 20
    },
    'height_40': {
        height: 40
    },
    'height_50': {
        height: 50
    },
    'text_align_left': {
        textAlign: "left"
    },
    'margin_bottom_80': {
        marginBottom: 80
    },
    'margin_end_10': {
        marginEnd: 10
    },
    'width_height_20': {
        width: 20,
        height: 20
    },
    'margin_left_30': {
        marginLeft: 30
    },
    'opacity_0.5': {
        opacity: 0.5
    },
    'border_1': {
        borderWidth: 1.0,
    },
    'margin_top_2': {
        marginTop: 2
    },
    'margin_top_3': {
        marginTop: 3
    },
    'margin_top_5': {
        marginTop: 5
    },

    'padding_left_10': {
        paddingLeft: 10
    },
    'padding_right_10': {
        paddingRight: 10
    },
    'padding_left_30': {
        paddingLeft: 30
    },
    'border_radius_5': {
        borderRadius: 5
    },
    'border_radius_6': {
        borderRadius: 6
    },
    'border_radius_50': {
        borderRadius: 50
    },
    'margin_left_30': {
        marginLeft: 30
    },
    'width_200': {
        width: 200
    },
    'border_top_width_0': {
        borderTopWidth: 0
    },
    'width_height_50': {
        width: 50,
        height: 50
    },
    'width_height_3_30': {
        width: 3,
        height: 30
    },
    'width_height_7_7': {
        width: 7,
        height: 7
    },

    'height_20%': {
        height: '20%'
    },
    'height_40%': {
        height: '40%'
    },
    'right_10': {
        right: 10
    },
    'right_15': {
        right: 15
    },
    'right_20': {
        right: 20
    },
    'right_30': {
        right: 30
    },
    'space_evenly': {
        justifyContent: "space-evenly"
    },
    'space_between': {
        justifyContent: "space-between"
    },
    'width_150': {
        width: 150
    },
    'bottom_minus_20': {
        bottom: -20
    },
    'bottom_0': {
        bottom: 0
    },
    'width_height_75': {
        width: 75,
        height: 75
    },
    'bottom_only_60': {
        bottom: 60
    },
    'margin_top_minus_30': {
        marginTop: -30
    },
    'margin_bottom_40': {
        marginBottom: 40
    },
    'bottom_minus_20': {
        bottom: -20
    },
    'bottom_0': {
        bottom: 0
    },
    'width_height_75': {
        width: 75,
        height: 75
    },
    'margin_top_minus_3': {
        marginTop: -3
    },
    'height_90': {
        height: 90
    },
    'min_height_180': {
        minHeight: 180
    },
    'min_height_360': {
        minHeight: 360
    },
    'margin_top_40': {
        marginTop: 40
    },
    'margin_top_45': {
        marginTop: 45
    },
    'margin_bottom_20': {
        marginBottom: 20
    },
    'min_height_80': {
        minHeight: 80
    },
    'width_height_15': {
        width: 15,
        height: 15
    },
    'width_height_5': {
        width: 5,
        height: 5
    },
    'width_height_7': {
        width: 7,
        height: 7
    },
    'width_height_30': {
        width: 30,
        height: 30
    },
    'width_95%': {
        width: '95%'
    },
    'width_5%': {
        width: '5%'
    },
    'left_46': {
        left: 46
    },
    'left_top_46': {
        left: 46,
        top: 46
    },
    'width_height_97_20': {
        width: 97,
        height: 20,
    },
    'align_self_flex_start': {
        alignSelf: 'flex-start'
    },
    'align_items_flex_start': {
        alignItems: 'flex-start'
    },
    'align_items_flex_end': {
        alignItems: 'flex-end'
    },
    'align_flex_end': {
        alignSelf: 'flex-end'
    },
    'width_40%': {
        width: '40%'
    },
    'min_height_470': {
        minHeight: 470
    },
    'width_height_160': {
        width: 160,
        height: 160
    },
    'width_height_180': {
        width: 180,
        height: 180
    },
    'borderTopRightRadius_50': {
        borderTopRightRadius: 50
    },
    'borderBottomLeftRadius_50': {
        borderBottomLeftRadius: 50
    },
    'borderTopRightRadius_25': {
        borderTopRightRadius: 25
    },
    'borderBottomRightRadius_25': {
        borderBottomRightRadius: 25
    },
    'borderBottomLeftRadius_25': {
        borderBottomLeftRadius: 25
    },
    'borderTopLeftRadius_25': {
        borderTopLeftRadius: 25
    },
    'margin_top_10': {
        marginTop: 10
    },
    'margin_top_15': {
        marginTop: 15
    },
    'top_right_49': {
        top: 49,
        right: 49
    },
    'add_money_css': {
        minWidth: 96,
        height: 34,
        borderRadius: 50,
        borderWidth: 2,
        padding: 3,
        top: 24
    },
    'fontWeight_700': {
        fontWeight: 700
    },
    'borderTopLeftRadius_50': {
        borderTopLeftRadius: 50
    },
    'borderBottomRightRadius_50': {
        borderBottomRightRadius: 50
    },
    'minHeight_90': {
        minHeight: 90
    },
    'minHeight_80': {
        minHeight: 90
    },
    'width_85%': {
        width: '85%'
    },
    'padding_10': {
        padding: 10
    },
    "margin_30": {
        margin: 30
    },
    "margin_right_40": {
        marginRight: 40
    },
    'max_height_80': {
        maxHeight: '80%'
    },
    'height_80%': {
        height: '80%'
    },
    'margin_10': {
        margin: 10
    },
    'border_radius_30': {
        borderRadius: 30
    },
    'button_height_45': {
        height: 45
    },
    'height_45': {
        height: 45
    },
    'height_35': {
        height: 35
    },
    'margin_bottom_10': {
        marginBottom: 10
    },
    'padding_5': {
        padding: 5
    },
    "divider": {
        width: '100%',
        height: 3
    },
    'border_radius_normal': {
        borderRadius: 5
    },
    'margin_30': {
        margin: 30
    },
    'max_height_80%': {
        maxHeight: '80%'
    },
    'left_10': {
        left: 10
    },
    'top_30': {
        top: 30
    },
    'top_40%': {
        top: "40%"
    },
    'width_20%': {
        width: "20%"
    },
    'height_60%': {
        height: "60%"
    },
    'margin_left_10': {
        marginLeft: 10
    },
    'margin_bottom_100': {
        marginBottom: 100
    },
    'height_0.5': {
        height: 0.5
    },
    'height_1': {
        height: 1
    },
    'height_2': {
        height: 2
    },
    'height_4': {
        height: 4
    },
    "quick_links_card_style": {
        elevation: 20,
        borderRadius: 10
    },
    'margin_left_40': {
        marginLeft: 40
    },
    'max_height_140': {
        maxHeight: 140
    },
    'height_140': {
        height: 140
    },
    'height_150': {
        height: 150
    },
    'border_radius_50': {
        borderRadius: 50
    },
    'height_100': {
        height: 100
    },
    'opacity_0.4': {
        opacity: 0.4
    },
    'width_height_35': {
        width: 35,
        height: 35
    },
    'width_height_8': {
        width: 8,
        height: 8
    },
    'width_height_45': {
        width: 45,
        height: 45
    },
    'bottom_only_80': {
        bottom: 80
    },
    'width_50%': {
        width: '50%'
    },
    'width_45%': {
        width: '45%'
    },
    'top_5': {
        top: 5
    },
    'top_4': {
        top: 4
    },
    'top_3': {
        top: 3
    },
    'height_2': {
        height: 2
    },
    'padding_botttom_10': {
        paddingBottom: 10
    },
    'height_75%': {
        height: '75%'
    },
    'width_height_40': {
        width: 40,
        height: 40
    },
    'width_height_90': {
        width: 90,
        height: 90
    },
    'width_height_100': {
        width: 100,
        height: 100
    },
    'width_height_110': {
        width: 110,
        height: 110
    },
    'width_height_120': {
        width: 120,
        height: 120
    },
    'height_400': {
        height: 400
    },
    'height_450': {
        height: 450
    },
    'height_15': {
        height: 15
    },
    'margin_top_60': {
        marginTop: 60
    },
    'width_120': {
        width: 120
    },
    'right_0': {
        right: 0
    },

    'top_only_munus_2': {
        top: -2
    },
    'margin_top_8': {
        marginTop: 8
    },
    'margin_bottom_25%': {
        marginBottom: '25%'
    },
    'height_250': {
        height: 250
    },
    'left_45%': {
        left: '45%'
    },
    'left_55%': {
        left: '55%'
    },
    'bottom_10%': {
        bottom: '10%'
    },
    'bottom_6%': {
        bottom: '6%'
    },
    'bottom_15%': {
        bottom: '15%'
    },
    'bottom_20%': {
        bottom: '20%'
    },
    'right_minus_10%': {
        right: '-10%'
    },
    'right_5%': {
        right: '5%'
    },
    'top_20%': {
        top: '20%'
    },
    'height_10': {
        height: 10
    },
    'width_5': {
        width: 5
    },
    'margin_top_minus_5': {
        marginTop: -5
    },
    'margin_top_minus_7': {
        marginTop: -7
    },
    'margin_top_minus_12': {
        marginTop: -12
    },
    'bottom_minus_10': {
        bottom: -10
    },
    'align_items_end': {
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end'
    },
    'height_95%': {
        height: '95%'
    },
    'margin_20': {
        margin: 20
    },
    'top_20': {
        top: 20
    },
    'width_48%': {
        width: '48%'
    },
    'width_75%': {
        width: '75%'
    },
    'margin_top_minus_50': {
        marginTop: -50
    },
    'margin_top_minus_70': {
        marginTop: -70
    },
    'margin_top_2': {
        marginTop: 2
    },
    'right_minus_35%': {
        right: '-35%'
    },
    'top_6%': {
        top: '6%'
    },
    'height_10%': {
        height: "10%"
    },
    'width_18': {
        width: 18
    },
    'height_20': {
        height: 20
    },
    'width_33.3%': {
        width: "33.3%"
    },
    'zindex_9999': {
        zIndex: 9999
    },
    "width_29_height_20": {
        width: 29,
        height: 20
    },
    'width_15%': {
        width: '15%'
    },
    'margin_top_80': {
        marginTop: 80
    },
    'padding_horizontal_10': {
        paddingHorizontal: 10
    },
    'height_25%': {
        height: '25%'
    },
    'height_120': {
        height: 120
    },
    'padding_40': {
        padding: 40
    },
    'border_left_radius_50': {
        borderTopLeftRadius: 50
    },
    'border_right_radius_50': {
        borderTopRightRadius: 50
    },
    'margin_bottom_25': {
        marginBottom: 25
    },
    'border_radius_10': {
        borderRadius: 10
    },
    'border_radius_12.5': {
        borderRadius: 12.5
    },
    'bottom_30': {
        bottom: 30
    },
    'right_5': {
        right: 5
    },
    'width_height_10': {
        width: 10,
        height: 10
    },
    'margin_vertical_5': {
        marginVertical: 5
    },
    'min_height_70': {
        minHeight: 70
    },
    'left_10%': {
        left: '10%'
    },
    'min_height_75%': {
        minHeight: '75%'
    },
    'min_height_65%': {
        minHeight: '65%'
    },
    'min_height_70%': {
        minHeight: '70%'
    },
    'max_height_120': {
        maxHeight: 120
    },
    'right_100': {
        right: 100
    },
    'height_30': {
        height: 30
    },
    'width_35': {
        width: 35
    },
    'width_15': {
        width: 15
    },
    'right_80': {
        right: 80
    },
    'width_20': {
        width: 20
    },
    'right_50': {
        right: 50
    },
    'padding_vertical_20': {
        paddingVertical: 20
    },
    'padding_vertical_10': {
        paddingVertical: 10
    },
    'padding_vertical_5': {
        paddingVertical: 5
    },
    'width_30': {
        width: 30
    },
    'right_25': {
        right: 25
    },
    'bottom_minus_1': {
        bottom: -1
    },
    'bottom_minus_5': {
        bottom: -5
    },
    'margin_top_minus_10': {
        marginTop: -10
    },
    'right_45': {
        right: 45
    },
    'margin_bottom_130': {
        marginBottom: 130
    },
    'width_25%': {
        width: '25%'
    },
    'width_28%': {
        width: '28%'
    },
    'margin_bottom_150': {
        marginBottom: 150
    },
    'margin_bottom_15': {
        marginBottom: 15
    },
    'width_100': {
        width: 100
    },
    'width_180': {
        width: 180
    },
    "widht_95%": {
        width: "95%"
    },
    "border_radius_normal_5": {
        borderRadius: 5
    },
    'border_bottom_left_radius_25': {
        borderBottomLeftRadius: 25
    },
    'border_bottom_right_radius_25': {
        borderBottomRightRadius: 25
    },
    'border_width_1': {
        borderWidth: 1
    },
    'border_width_0.5': {
        borderWidth: 0.5
    },
    'border_radius_100':
    {
        borderRadius: 100
    },
    'margin_horizontal_30': {
        marginHorizontal: 30
    },
    "width_46%": {
        width: '46%'
    },
    'height_350': {
        height: 350
    },
    'left_0': {
        left: 0
    },
    'top_0': {
        top: 0
    },
    'height_30%': {
        height: '30%'
    },
    'padding_horizontal_30': {
        paddingHorizontal: 30
    },
    "margin_right_10": {
        marginRight: 10
    },
    'margin_bottom_30': {
        marginBottom: 30
    },
    'justify_content_space-between': {
        justifyContent: 'space-between'
    },
    'resize_mode': {
        resizeMode: "contain",
    },
    'border_width_4': {
        borderWidth: 4,
    },
    'line_height_22': {
        lineHeight: 22
    },
    'text_transform_uppercase': {
        textTransform: "uppercase",
    },
    'border_width_2': {
        borderWidth: 2,
    },
    'margin_vertical_10': {
        marginVertical: 10
    },
    'bottom_50': {
        bottom: 50
    },
    'margin_left_18_minus': {
        marginLeft: -18,
    },
    'padding_horizontal_20': {
        paddingHorizontal: 20
    },
    'margin_top_3': {
        marginTop: 3
    },
    'height_75%': {
        height: '75%'
    },
    'bottom_100': {
        bottom: 100
    },
    "margin_right_5": {
        marginRight: 5
    },
    "border_top_width_2": {
        borderTopWidth: 2
    },
    "border_bottom_width_2": {
        borderBottomWidth: 2
    },
    'left_2': {
        left: 2
    },
    'left_5': {
        left: 5
    },
    'left_7': {
        left: 7
    },
    'min_height_150': {
        minHeight: 150
    },
    'left_-10': {
        marginLeft: -10
    },
    'margin_top_75': {
        marginTop: 75
    },
    'height_70%': {
        height: '70%'
    },
    'opacity_0': {
        opacity: 0
    },
    'padding_vertical_25': {
        paddingVertical: 25
    },
    'border_radius_20': {
        borderRadius: 20
    },
    'height_200': {
        height: 200
    },
    'right_7%': {
        right: '7%'
    },
    'margin_vertical_20': {
        marginVertical: 20
    },
    'top_50%': {
        top: "50%"
    },
    'height_90%': {
        height: "90%"
    },
    'margin_bottom_5': {
        marginBottom: 5
    },
    'bottom_20': {
        bottom: 20
    },
    'margin_bottom_50': {
        marginBottom: 50
    },
    'width_height_60': {
        width: 60,
        height: 60
    },
    'padding_20': {
        padding: 20
    },
    'padding_3': {
        padding: 3
    },
    'margin_top_minus_90': {
        marginTop: -90
    },
    'padding_botttom_150': {
        paddingBottom: 150
    },
    'letter_spacing_1': {
        letterSpacing: 1
    },
    'margin_top_minus_20': {
        marginTop: -20
    },
    'padding_right_40': {
        paddingRight: 40
    },
    'max_height_75': {
        maxHeight: 75
    },
    'top_minus_5': {
        top: -5
    },
    'right_minus_5': {
        right: -5
    },
    'margin_left_35': {
        marginLeft: 35
    },

    'padding_horizontal_48': {
        paddingHorizontal: 48
    },
    'margin_horizontal_48': {
        marginHorizontal: 48
    },
    'padding_horizontal_60': {
        paddingHorizontal: 60
    },
    'margin_horizontal_60': {
        marginHorizontal: 60
    },
    'margin_horizontal_30': {
        marginHorizontal: 30
    },
    'padding_horizontal_30': {
        paddingHorizontal: 30
    },
    'margin_left_30': {
        marginLeft: 30
    },
    'left_5': {
        marginLeft: 5
    },
    'aspect_ratio_1': {
        aspectRatio: 1
    },
    'width_12': {
        width: 12,
    },
    'padding_top_30': {
        paddingTop: 30
    },
    'padding_top_40': {
        paddingTop: 40
    },
    'margin_bottom_60': {
        marginBottom: 60
    },
    'padding_bottom_60': {
        paddingBottom: 60
    },
    'margin_horizontal_32.5': {
        marginHorizontal: 32.5
    },
    'width_height_53': {
        width: 53,
        height: 32
    },
    'padding_top_10': {
        paddingTop: 10
    },
    'height_5': {
        height: 5
    },
    'width_height_100': {
        width: 100,
        height: 100
    },
    'width_height_70': {
        width: 70,
        height: 70
    },
    'border_radius_40': {
        borderRadius: 40
    },
    'border_radius_80': {
        borderRadius: 80
    },
    'border_radius_8': {
        borderRadius: 8
    },
    'margin_left_minus_10': {
        marginLeft: -10
    },
    'padding_top_20': {
        paddingTop: 20
    },
    'line_height_15': {
        lineHeight: 15
    },
    'padding_top_60': {
        paddingTop: 60
    },
    'padding_bottom_20': {
        paddingBottom: 20
    },
    'padding_bottom_5': {
        paddingBottom: 5
    },
    'padding_bottom_30': {
        paddingBottom: 30
    },
    'padding_top_50': {
        paddingTop: 50
    },
    'padding_top_8': {
        paddingTop: 8
    },
    'margin_vertical_22': {
        marginVertical: 22
    },
    'margin_vertical_16': {
        marginVertical: 16
    },
    'margin_bottom_36': {
        marginBottom: 36
    },
    'margin_top_200': {
        marginTop: 200
    },
    'margin_top_250': {
        marginTop: 250
    },
    'padding_vertical_22': {
        paddingVertical: 22
    },
    "margin_right_20": {
        marginRight: 20
    },
    'border_left_radius_30': {
        borderTopLeftRadius: 30
    },
    'border_right_radius_30': {
        borderTopRightRadius: 30
    },
    'padding_30': {
        padding: 30
    },
    'width_height_73': {
        width: 73,
        height: 73,
        resizeMode: "contain"
    },
    'width_height_140': {
        width: 140,
        height: 140
    },
    'margin_top_90': {
        marginTop: 90
    },
    'width_98%': {
        width: '98%'
    },
    'width_99%': {
        width: '99%'
    },
    'padding_right_5': {
        paddingRight: 5
    },
    'padding_right_50': {
        paddingRight: 50
    },
    'line_height_20': {
        lineHeight: 20
    },
    'padding_8': {
        padding: 8
    },
    'width_50': {
        width: 50
    },
    'height_85%': {
        height: '85%'
    },
    'margin_horizontal_20': {
        marginHorizontal: 20
    },
    "margin_right_48": {
        marginRight: 48
    },
    'margin_top_120': {
        marginTop: 120
    },
    'margin_left_15': {
        marginLeft: 15
    },
    'height_270': {
        height: 270
    },
    'min_height_85%': {
        minHeight: '85%'
    },
    'max_height_100%': {
        maxHeight: '100%'
    },
    'margin_right_100': {
        marginRight: 100
    },
    'height_75': {
        height: 75
    },
    'margin_horizontal_10': {
        marginHorizontal: 10
    },
    "padding_80": {
        padding: 80
    },
    'border_bottom_left_radius_50': {
        borderBottomLeftRadius: 50
    },
    'width_height_250': {
        width: 250,
        height: 250
    },
    'font_size_8_regular': {
        fontSize: 8,
        fontFamily: FontForWeight('regular')
    },
    'font_size_10_regular': {
        fontSize: 10,
        fontFamily: FontForWeight('regular')
    },
    'font_size_11_regular': {
        fontSize: 11,
        fontFamily: FontForWeight('regular')
    },
    'font_size_11_semibold': {
        fontSize: 11,
        fontFamily: FontForWeight('SemiBold')
    },
    'font_size_12_regular': {
        fontSize: 12,
        fontFamily: FontForWeight('regular')
    },
    'font_size_12_semibold': {
        fontSize: 12,
        fontFamily: FontForWeight('SemiBold')
    },
    'font_size_7_bold': {
        fontSize: 7,
        fontFamily: FontForWeight('bold')
    },
    'font_size_6.5_regular': {
          fontSize: 6.5,
          fontFamily: FontForWeight('regular')
      },
    'font_size_13_regular': {
        fontSize: 13,
        fontFamily: FontForWeight('regular')
    },
    'font_size_13_semibold': {
        fontSize: 13,
        fontFamily: FontForWeight('SemiBold')
    },
    'font_size_14_regular': {
        fontSize: 14,
        fontFamily: FontForWeight('regular')
    },
    'font_size_14_semibold': {
        fontSize: 14,
        fontFamily: FontForWeight('SemiBold')
    },
    'font_size_14_bold': {
        fontSize: 14,
        fontFamily: FontForWeight('bold')
    },
    'font_size_16_regular': {
        fontSize: 16,
        fontFamily: FontForWeight('regular')
    },
    'font_size_16_semibold': {
        fontSize: 16,
        fontFamily: FontForWeight('SemiBold')
    },
    'font_size_16_bold': {
        fontSize: 16,
        fontFamily: FontForWeight('bold')
    },
    'font_size_17_regular': {
        fontSize: 17,
        fontFamily: FontForWeight('regular')
    },
    'font_size_17_semibold': {
        fontSize: 17,
        fontFamily: FontForWeight('SemiBold')
    },
    'font_size_18_regular': {
        fontSize: 18,
        fontFamily: FontForWeight('regular')
    },
    'font_size_18_semibold': {
        fontFamily: FontForWeight('SemiBold'),
        fontSize: 18
    },
    'font_size_18_bold': {
        fontSize: 18,
        fontFamily: FontForWeight('bold')
    },
    'font_size_20_bold': {
        fontSize: 20,
        fontFamily: FontForWeight('bold')
    },
    'font_size_22_regular': {
        fontSize: 22,
        fontFamily: FontForWeight('regular')
    },
    'font_size_22_bold': {
        fontSize: 22,
        fontFamily: FontForWeight('bold')
    },
    'font_size_23_semibold': {
        fontSize: 23,
        fontFamily: FontForWeight('SemiBold')
    },
    'font_size_24_semibold': {
        fontSize: 24,
        fontFamily: FontForWeight('SemiBold')
    },
    'font_size_24_bold': {
        fontSize: 24,
        fontFamily: FontForWeight('bold')
    },
    'font_size_26_semibold': {
        fontSize: 26,
        fontFamily: FontForWeight('SemiBold')
    },
    'border_color_light_grey': {
        borderColor: Colors.very_light_grey
    },
    'border_color_grey': {
        borderColor: Colors.grey
    },
    'border_color_red': {
        borderColor: Colors.red
    },
    'border_color_orange': {
        borderColor: Colors.buttonOrange
    },
    'margin_5': {
        margin: 5
    },
    'right_minus_10': {
        right: -10
    },
    'top_only_10': {
        top: 10
    },
    'height_300': {
        height: 300
    },
    'margin_top_minus_200': {
        marginTop: -200
    },
    'height_160': {
        height: 160
    },
    'height_220': {
        height: 220
    },
    'height_240': {
        height: 240
    },
    "min_width_60": {
        minWidth: 60
    },
    'height_280': {
        height: 280
    },
    'bottom_5': {
        bottom: 5
    },
    'height_55': {
        height: 55
    },
    'width_40': {
        width: 40
    },
    'top_minus_10': {
        top: -10
    },
    'top_minus_12': {
        top: -12
    },
    'top_minus_13': {
        top: -13
    },
    'top_minus_25': {
        top: -25
    },
    'top_minus_30': {
        top: -30
    },
    'bottom_90': {
        bottom: 90
    },
    'bg_black_0.3': {
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    'top_minus_2': {
        top: -2
    },
    'height_0.5': {
        height: 0.5
    },
    'width_1': {
        width: 1
    },
    'left_only_14': {
        left: 14
    },
    'height_25': {
        height: 25
    },
    'border_radius_15': {
        borderRadius: 15
    },
    'overflow_hidden': {
        overflow: 'hidden'
    },
    "width_60": {
        width: 60
    },
    "min_width_100": {
        minWidth: 100
    },
    'min_height_100': {
        minHeight: 100
    },
    'bottom_120': {
        bottom: 120
    },
    'margin_horizontal_5': {
        marginHorizontal: 5
    },
    'height_500': {
        height: 500
    },
    'shadow_box': {
        shadowColor: Colors.light_grey,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: (Platform.OS == 'android') ? 10 : 2,
    },
    'shadow_box_black': {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: (Platform.OS == 'android') ? 10 : 2,
    },
    'transparent_black_bg': {
        backgroundColor: Colors.blackTransparent
    },
    'transparent_bg': {
        backgroundColor: Colors.transparent
    },
    'aspect_ratio_1_1': {
        aspectRatio: 1,
    },


    ///Added by junior
    'padding_left_15': {
        paddingLeft: 15
    },
    'padding_horizontal_5': {
        paddingHorizontal: 5
    },
    'margin_horizontal_15': {
        marginHorizontal: 15
    },
    'height_9%': {
        height: '9%'
    },
    'padding_14': {
        padding: 14
    },
    'border_color_lightish_grey': {
        borderColor: Colors.lightish_grey
    },
    'width_47%': {
        width: '47%'
    },
    'space_around': {
        justifyContent: "space-around"
    },
    //new
    'margin_15': {
        margin: 15
    },
    'height_35%': {
        height: '35%'
    },
    'width_190': {
        width: 190
    },
    'margin_left_135': {
        marginLeft: 135
    },
    'margin_top_28%': {
        marginTop: "28%"
    },
    'font_size_58_semibold': {
        fontSize: 58,
        fontFamily: FontForWeight('SemiBold')
    },
    'font_size_50_semibold': {
        fontSize: 50,
        fontFamily: FontForWeight('SemiBold')
    },
    'height_18': {
        height: 18
    },
    'margin_14': {
        margin: 14
    },
    'width_186': {
        width: 186
    },
    'height_65': {
        height: 65
    },
    'padding_horizontal_15': {
        paddingHorizontal: 15
    },
    'margin_top_minus_75': {
        marginTop: -80
    },
    'margin_left_160': {
        marginLeft: 160
    },
    "border_bottom_width_1": {
        borderBottomWidth: 1
    },
    'padding_horizontal_90': {
        paddingHorizontal: 90
    },
    'padding_horizontal_35': {
        paddingHorizontal: 35
    },
    'height_28': {
        height: 28
    },
    'padding_4': {
        padding: 4
    },
    'text_color_lightgrey': {
        color: Colors.lightgrey
    },
    'bg_blue': {
        backgroundColor: Colors.blue
    },
    'margin_left_auto': {
        marginLeft: 'auto'
    },
    'bg_pink': {
        backgroundColor: Colors.pink
    },
    'padding_horizontal_5': {
        paddingHorizontal: 5
    },
    'border_gray_color': {
        borderColor: Colors.boderGreyColor
    },
    'backgroundGreyColor': {
        backgroundColor: Colors.boderGreyColor
    },
    'font_size_6_regular': {
        fontSize: 6,
        fontFamily: FontForWeight('regular')
    },
    'padding_vertical_3': {
        paddingVertical: 3
    },
    'font_size_12_bold': {
        fontSize: 12,
        fontFamily: FontForWeight('bold')
    },
    'width_95': {
        width: 95
    },
    'font_size_10_bold': {
        fontSize: 10,
        fontFamily: FontForWeight('bold')
    },
    'bg_purple': {
        backgroundColor: Colors.purple
    },
    'width_height_17': {
        width: 17,
        height: 17
    },
    'left_25': {
        marginLeft: 30,
    },
    'width_300': {
        width: 330
    },
    'text_color_purple': {
        color: Colors.purple
    },
    'margin_25': {
        margin: 55
    },
    'padding_15': {
        padding: 15
    },
    'gap_10' : {
        gap : 10
    }
}

