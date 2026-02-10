import React from 'react';
import { View } from 'react-native';

const DiamondView = () => {
    return (
        <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: 100,
            height: 100,
            transform: [{ rotate: '45deg' }]
        }}>
            <View style={{
                width: 100,
                height: 100,
                backgroundColor: 'red'
            }} />
        </View>
    );
};

export default DiamondView;
