import moment from 'moment';
import * as React from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { strings } from '../strings/strings';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { Styles } from '../assets/style/styles';
import { Colors } from '../assets/Utils/Color';
import { translate } from '../Localisation/Localisation';
import { createStyles } from '../assets/style/createStyles';


var styles = BuildStyleOverwrite(Styles);
export default class CustomCalendarModal extends React.Component {

    constructor(props) {
        super(props);
        styles = React.useMemo(() => createStyles(), [global.selectedLanguageCode]);
        this.state = {
            hideNext: false,
            hidePrev: false,
            activeDate: this.props.date != undefined ? this.props.date : new Date(),
            selectedDate: this.props.date != undefined ? JSON.stringify(this.props.date).slice(1, 11) : JSON.stringify(new Date()).slice(1, 11),
            minimumDate: this.props.minimumDate != undefined ? this.props.minimumDate : new Date(),
            maximumDate: this.props.maximumDate != undefined ? this.props.maximumDate : "",
            fromLumivia: this.props.fromLumivia != undefined ? this.props.fromLumivia : false,
            labelName: this.props.labelName != undefined ? this.props.labelName : "",
            months: ["January", "February", "March", "April",
                "May", "June", "July", "August", "September", "October",
                "November", "December"
            ],
            monthsDigit: ["01", "02", "03", "04",
                "05", "06", "07", "08", "09", "10",
                "11", "12"
            ],
            weekDays: [
                "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
            ],
            nDays: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

        }
    }
    componentDidMount() {
        let { minimumDate, maximumDate } = this.state
        minimumDate = JSON.stringify(this.state.minimumDate).slice(1, 11).replace("-", "").replace("-", "");
        if (this.state.maximumDate != "") { maximumDate = JSON.stringify(this.state.maximumDate).slice(1, 11).replace("-", "").replace("-", ""); }
        this.setState({
            minimumDate,
            maximumDate
        })

        // this.hideAndShowMonth()
    }
    _onPress = (item) => {
        if (item.match == undefined && item != -1) {
            let { activeDate, selectedDate } = this.state
            let octalItems = ("0" + item).slice(-2)
            activeDate.setDate(item);
            selectedDate = JSON.stringify(activeDate.getFullYear()).concat("-", this.state.monthsDigit[this.state.activeDate.getMonth()].concat("-", octalItems))
            this.setState({ activeDate, selectedDate }, () => {
                console.log(this.state.selectedDate)
            })
        }
    }

    changeMonth = (n, type) => {
        console.log("123", this.state.activeDate, this.state.selectedDate)
        if (this.state.minimumDate != undefined && type == "previous") {
            const startOfMonth = moment(this.state.activeDate, "YYYY-MM-DD").startOf('month').format('YYYYMMDD');
            const minimumDate = JSON.stringify(this.state.minimumDate).slice(1, 11).replace("-", "").replace("-", "");
            if (startOfMonth > minimumDate) {
                console.log("monthPrev", this.state.activeDate + "---" + startOfMonth + "---" + minimumDate)

                this.setState(() => {
                    this.state.activeDate.setMonth(
                        this.state.activeDate.getMonth() + n
                    )
                    return this.state;
                });
                // this.hideAndShowMonth()
            }
        }
        if (this.state.maximumDate != "" && type == "next") {
            const endOfMonth = moment(this.state.activeDate, "YYYY-MM-DD").endOf('month').format('YYYYMMDD');
            const maximumDate = JSON.stringify(this.state.maximumDate).slice(1, 11).replace("-", "").replace("-", "");
            if (endOfMonth < maximumDate) {
                this.setState(() => {
                    this.state.activeDate.setMonth(
                        this.state.activeDate.getMonth() + n
                    )
                    return this.state;
                });
                // this.hideAndShowMonth()
            }
        }
        else if (type == "next") {
            this.setState(() => {
                this.state.activeDate.setMonth(
                    this.state.activeDate.getMonth() + n
                )
                return this.state;
            }, () => {
                console.log("monthNext", this.state.activeDate)
            });
        }
    }

    changeYear = (n, type) => {
        console.log("123", this.state.activeDate, this.state.selectedDate)
        if (this.state.minimumDate != undefined && type == "previous") {
            const startOfMonth = moment(this.state.activeDate, "YYYY-MM-DD").startOf('month').format('YYYYMMDD');
            const minimumDate = JSON.stringify(this.state.minimumDate).slice(1, 11).replace("-", "").replace("-", "");

            console.log("what is startM", startOfMonth)
            console.log("what is minDate", minimumDate)
            if (startOfMonth > minimumDate) {
                console.log("yearPrev", this.state.activeDate + "---" + startOfMonth + "---" + minimumDate)

                this.setState(() => {
                    this.state.activeDate.setMonth(
                        this.state.activeDate.getMonth() + n
                    )
                    return this.state;
                });
                // this.hideAndShowMonth()
            }
        }
        if (this.state.maximumDate != "" && type == "next") {
            const endOfMonth = moment(this.state.activeDate, "YYYY-MM-DD").endOf('month').format('YYYYMMDD');
            const maximumDate = JSON.stringify(this.state.maximumDate).slice(1, 11).replace("-", "").replace("-", "");
            if (endOfMonth < maximumDate) {
                this.setState(() => {
                    this.state.activeDate.setMonth(
                        this.state.activeDate.getMonth() + n
                    )
                    return this.state;
                });
                // this.hideAndShowMonth()
            }
        }
        else if (type == "next") {
            this.setState(() => {
                this.state.activeDate.setMonth(
                    this.state.activeDate.getMonth() + n
                )
                return this.state;
            }, () => {
                console.log("yearNext", this.state.activeDate)
            });
        }
    }


    generateMatrix() {
        var matrix = [];
        // Create header
        matrix[0] = this.state.weekDays;

        var year = this.state.activeDate.getFullYear();
        var month = this.state.activeDate.getMonth();
        var firstDay = new Date(year, month, 1).getDay();

        var maxDays = this.state.nDays[month];
        if (month == 1) { // February
            if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
                maxDays += 1;
            }
        }

        var counter = 1;
        for (var row = 1; row < 7; row++) {
            matrix[row] = [];
            for (var col = 0; col < 7; col++) {
                matrix[row][col] = -1;
                if (row == 1 && col >= firstDay) {
                    // Fill in rows only after the first day of the month
                    matrix[row][col] = counter++;
                } else if (row > 1 && counter <= maxDays) {
                    // Fill in rows only if the counter's not greater than
                    // the number of days in the month
                    matrix[row][col] = counter++;
                }
            }
        }

        return matrix;
    }
    render() {
        var matrix = this.generateMatrix();

        var rows = [];
        rows = matrix.map((row, rowIndex) => {
            var rowItems = row.map((item, colIndex) => {
                // console.log("sasasas", item)
                // let eachDate = JSON.stringify(moment(1, "DD"));
                let octalItems = ("0" + item).slice(-2)
                let Dates = JSON.stringify(this.state.activeDate.getFullYear()).concat(this.state.monthsDigit[this.state.activeDate.getMonth()].concat(octalItems))
                let selectedDate = this.state.selectedDate.replace("-", "").replace("-", "")
                return (
                    <View key={Math.random() * 10000} style={[{
                        width: 35,
                        backgroundColor: this.state.maximumDate != "" ? (Dates >= this.state.minimumDate && Dates <= this.state.maximumDate) ? item == this.state.activeDate.getDate()
                            ? Colors.grey : 'white' : "white" : (Dates >= this.state.minimumDate) ? selectedDate == Dates
                                ? Colors.grey : 'white' : "white",
                        margin: 2,
                        borderRadius: item == this.state.activeDate.getDate()
                            ? 50 : 0,
                        justifyContent: "center"

                    }]}>
                        <Text
                            style={[{
                                height: 35,

                                // Highlight header
                                // backgroundColor: rowIndex == 0 ? '#ddd' : '#fff',
                                // Highlight Sundays
                                // color: colIndex == 0 ? '#a00' : '#000',
                                fontSize: 12,
                                padding: 8,
                                // Highlight current date
                                // : item == this.state.activeDate.getDate()
                                //     ? 'bold' : '1000',
                                color: this.state.maximumDate != "" ? (Dates >= this.state.minimumDate && Dates <= this.state.maximumDate) ? item == this.state.activeDate.getDate()
                                    ? 'white' : 'black' : "grey" : (Dates >= this.state.minimumDate) ? selectedDate == Dates
                                        ? 'white' : 'black' : "grey",
                                alignItems: "center",

                            }, styles["text_align_center"]]}
                            onPress={() => {
                                if (this.state.maximumDate != "") {
                                    if (Dates >= this.state.minimumDate && Dates <= this.state.maximumDate) {
                                        this._onPress(item)
                                    }
                                } else if (Dates >= this.state.minimumDate) {
                                    this._onPress(item)
                                }
                            }
                            }>
                            {item != -1 ? item : ''}
                        </Text>
                    </View>
                );
            });

            return (
                <View key={Math.random() * 10000}
                    style={[styles['flex_direction_row'], styles["justify_content_center"]]}>
                    {rowItems}
                </View>
            );
        });
        return (
            <Modal
                transparent={true}
                animationType='fade'
                onRequestClose={() => { console.log('close modal') }}
                visible={true}
                style={[styles["margin_10"], styles["border_radius_normal"], styles["centerItems"],]}>
                <View style={[styles['height_100%'], styles['justify_content_center'], { backgroundColor: "#000000d6", }]}>
                    <View style={[{ alignItems: "center" }, styles["border_radius_normal"], styles["bg_white"], styles["margin_10"]]}>
                        <View style={[styles["flex_direction_row"], styles["width_95%"], styles["space_between"], styles["bg_white"], styles["margin_top_15"], styles["margin_bottom_15"]]}>
                            <Text style={[styles["font_size_16_semibold"], styles["text_align_left"], styles["text_color_black"], styles["padding_20"]]}>
                                {
                                    this.state.labelName
                                }
                            </Text>
                            <TouchableOpacity
                                onPress={() => this.props.onCancel()}
                            >
                                <Image source={require("../assets/images/close.png")} style={[styles["width_height_20"], { top: 20, right: 20, tintColor: 'red' }]} />
                            </TouchableOpacity>
                        </View>
                        <View
                            style={[
                                styles["bg_white"], styles["border_radius_normal"], styles["border_bottom_left_radius_8"],
                                styles["border_bottom_right_radius_8"], styles["border_width_1"], styles["border_color_grey"],
                                styles["padding_10"], styles["margin_bottom_20"], styles["margin_horizontal_30"], styles["width_90%"]]}
                        >


                            <View style={[styles["flex_direction_row"], styles["space_between"], styles["width_95%"]]}>
                                <Text style={[styles["font_size_14_regular"], styles["text_align_left"], styles["text_color_orange"], styles["padding_5"]]}>
                                    {/* {"Hello Brother!!"} */}
                                    {this.state.activeDate.getFullYear()}
                                </Text>
                                <View style={[styles["flex_direction_row"], styles["align_self_center"],]}>
                                    {!this.state.hidePrev &&
                                        <TouchableOpacity
                                            onPress={() => this.changeYear(-12, "previous")}><Image source={require("../assets/images/left_arrow_new.png")} style={[styles["width_height_15"], styles["margin_right_40"]]} />
                                        </TouchableOpacity>}
                                    {!this.state.hideNext &&
                                        <TouchableOpacity
                                            onPress={() => this.changeYear(+12, "next")}><Image source={require("../assets/images/right_arrow_new.png")} style={[styles["width_height_15"]]} />
                                        </TouchableOpacity>}

                                </View>
                            </View>


                            <View style={[styles["flex_direction_row"], styles["space_between"], styles["width_95%"]]}>
                                <Text style={[styles["font_size_16_regular"], styles["text_align_left"], styles["text_color_green"], styles["padding_5"]]}>
                                    {this.state.months[this.state.activeDate.getMonth()]} &nbsp;
                                </Text>
                                <View style={[styles["flex_direction_row"], styles["align_self_center"],]}>
                                    {!this.state.hidePrev &&
                                        <TouchableOpacity
                                            onPress={() => this.changeMonth(-1, "previous")}><Image source={require("../assets/images/left_arrow_new.png")} style={[styles["width_height_15"], styles["margin_right_40"]]} />
                                        </TouchableOpacity>}
                                    {!this.state.hideNext &&
                                        <TouchableOpacity
                                            onPress={() => this.changeMonth(+1, "next")}><Image source={require("../assets/images/right_arrow_new.png")} style={[styles["width_height_15"]]} />
                                        </TouchableOpacity>}

                                </View>
                            </View>

                            <View style={[styles["width_95%"], { height: 2, backgroundColor: Colors.grey }, styles["margin_bottom_15"], styles['align_self_center']]}></View>
                            {rows}
                        </View>
                        <View style={[styles["flex_direction_row"], styles["space_evenly"], styles["width_95%"]]}>
                            <TouchableOpacity
                                onPress={() => this.props.onCancel()}
                                style={[styles["padding_10"], styles['width_46%'], styles['bg_red'], { borderStyle: "solid", borderWidth: 0 }, styles["margin_bottom_15"], styles["border_radius_normal"], styles["border_color_blue"]]}>
                                <Text style={[styles["text_color_white"], styles["text_align_center"], styles["font_size_12_regular"]]}>{translate('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this.props.onConfirm(this.state.selectedDate)
                            }

                            } style={[styles["bg_green"], styles["padding_10"], styles['width_46%'], styles["margin_bottom_15"], styles["border_radius_normal"]]}>
                                <Text style={[styles["text_color_white"], styles["text_align_center"], styles["font_size_12_regular"]]}>{translate('ok')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}