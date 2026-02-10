import React, { useMemo, useState } from "react";
import { View, StatusBar, Text, Image, TouchableOpacity } from 'react-native';
import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { strings } from "../strings/strings";
import { translate } from "../Localisation/Localisation";
import { createStyles } from "../assets/style/createStyles";
var styles = BuildStyleOverwrite(Styles);

const onboardingData = [
    {
        image: require('../assets/images/board_1.png'),
        title: translate('redeemed_points'),
        text: translate('descOne'),
        bottomImage: require('../assets/images/board_1_1.png')
    },
    {
        image: require('../assets/images/board_1.png'),
        title: translate('productScan'),
        text: translate('descTwo'),
        bottomImage: require('../assets/images/board_1_2.png')
    },
    {
        image: require('../assets/images/board_1.png'),
        title: translate('reward_points'),
        text: translate('descThree'),
        bottomImage: ''
    }
];

const OnBoardingScreen = ({data, onNext}) => {

    const [step, setStep] = useState(0);
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const handleNext = () => {
        console.log('kkjkk01',onboardingData.length)
        console.log('kkjkk02',step)
        if (step < onboardingData.length - 1) {
            console.log('came heeee')
          setStep(step + 1);
        } else {
          // Finish the onboarding process
          console.log('Onboarding finished!');
        }
      };

    return (
        <View style={[styles['centerItems']]}>
             <View style={[styles['flex_1'], styles['width_90%'], styles['centerItems']]}>
                <Image
                    source={require('../assets/images/stars_ic.png')}
                    style={[{ width: 180, height: 180, alignSelf: 'flex-end' }]}
                />
                <View style={[styles['width_90%'], styles['centerItems']]}>
                    <Image
                        source={data.image}
                        style={[{ width: 250, height: 250, alignSelf: 'center' }]}
                    />
                </View>
                {/* dots */}
                <View style={[styles['margin_5']]}>
                    {/* indicator view  backgroundColor: '#69A3A7'*/}
                    <View
                        style={[{ width: 10, height: 10, borderColor: '#69A3A7', borderRadius: 6, borderWidth: 1, backgroundColor: '' },
                        styles['centerItems']]}>

                    </View>
                </View>

                <View style={[styles['margin_5'], styles['centerItems'], { width: 250 }]}>
                    <Text style={[styles['font_size_18_semibold'], { color: '#00873F' }]}>{data.title}</Text>
                    <Text style={[styles['font_size_13_semibold'], { color: '#000000', textAlign: 'center' }]}>
                        {data.text}
                    </Text>
                </View>
            </View>

            <View
                style={[styles['flex_direction_row'], styles['width_100%'], styles['centerItems'],
                { marginBottom: 50, height: 50 }]}>

                <TouchableOpacity
                    style={[{ width: '33%', height: 50, justifyContent: 'center', paddingStart: 10 }]}>
                    <Text style={[{ color: "#DB710E", fontSize: 14 }]}>{"Skip"}</Text>
                </TouchableOpacity>
                <View style={[{ width: '33%', height: 50, justifyContent: 'center' }]}>
                    <Image
                        source={data.bottomImage}
                        style={[{ width: 30, height: 30, alignSelf: 'center' }]}
                    />
                </View>
                <TouchableOpacity
                onPress={() => { handleNext() }}
                    style={[{ width: '33%', height: 50, justifyContent: 'center', paddingEnd: 10 }]}>
                    <Image
                        source={require('../assets/images/next_ic.png')}
                        style={[{ width: 30, height: 30, alignSelf: 'flex-end', }]}
                    />
                </TouchableOpacity>

            </View>
        </View>
    )
}

const OnBoarding = () => {

    const [step, setStep] = useState(0);
    const handleNext = () => {
        console.log('kkjkk11')
        if (step < onboardingData.length - 1) {
          setStep(step + 1);
        } else {
          // Finish the onboarding process
          console.log('Onboarding finished!');
        }
      };

    return (
        <View style={[styles['full_screen'], styles['centerItems'], styles['bg_white']]}>
            <StatusBar barStyle='dark-content' />
            
            <OnBoardingScreen data={onboardingData[step]} onNext={handleNext} />
        </View>
    );
}
export default OnBoarding;