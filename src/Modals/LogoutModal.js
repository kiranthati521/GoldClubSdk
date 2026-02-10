import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { getCompanyStyles, updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { translate } from '../Localisation/Localisation';


const LogoutModal = ({ visible, onSyncLogout, onNoSyncLogout, onClose }) => {

    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.modalView}>
                    <TouchableOpacity onPress={onClose} style={{ alignSelf: "flex-end" }}>
                        <Image source={require('../../src/assets/images/crossMark.png')}
                            style={{
                                height: 15,
                                width: 15,
                                resizeMode: "contain"
                            }} />
                    </TouchableOpacity>
                    <Text style={[styles.title,styles['font_size_18_bold']]}>{translate("logout")}</Text>
                    <Text style={styles.message}>{translate("are_you_sure_want_to_logout")}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={{ backgroundColor: dynamicStyles.primaryColor, padding: 12, borderRadius: 6, marginBottom: 10 }} onPress={onNoSyncLogout}>
                            <Text style={styles.buttonText}>{translate("Do_Not_Sync_Logout")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ padding: 12, borderRadius: 6, backgroundColor: dynamicStyles.primaryColor }} onPress={onSyncLogout}>
                            <Text style={styles.buttonText}>{translate('Sync_Logout')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Styles
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalView: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '85%',
        alignItems: 'center'
    },
    title: {
        color: "black"
    },
    message: {
        marginVertical: 10,
        textAlign: 'center',
        color: "black"
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'column',
        width: '100%'
    },
    noSyncButton: {
        backgroundColor: '#ff4d4d',
        padding: 12,
        borderRadius: 6,
        marginBottom: 10
    },
    syncButton: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 6
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center'
    }
});

export default LogoutModal;
