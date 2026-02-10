import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import CustomCalanderSelection from '../Components/CustomCalanderSelection';
import CustomButton from '../Components/CustomButton';

const RedemptionHistoryFilterModal = ({
  isVisible,
  onClose,
  fromDate,
  toDate,
  onFromDatePress,
  onToDatePress,
  onApplyPress,
  onClearPress,
  translate,
  dynamicStyles
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {translate ? translate('filterByDate') : 'Filter by Date'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Image source={require('../assets/images/close.png')} style={{ width: 20, height: 20, tintColor: '#333' }} />
            </TouchableOpacity>
          </View>

          {/* Date selectors */}
          <View style={styles.row}>
            <CustomCalanderSelection
              placeholder={translate ? translate('select') : 'Select'}
              width={[stylesCustom.width45]}
              defaultValue={fromDate}
              labelName={translate ? translate('from_Date') : 'From Date'}
              IsRequired={true}
              onFocus={onFromDatePress}
            />

            <CustomCalanderSelection
              placeholder={translate ? translate('select') : 'Select'}
              width={[stylesCustom.width45]}
              defaultValue={toDate}
              labelName={translate ? translate('to_date') : 'To Date'}
              IsRequired={true}
              onFocus={onToDatePress}
            />
          </View>

          {/* Buttons */}
          <View style={styles.footer}>
            <CustomButton
              title={translate ? translate('apply') : 'Apply'}
              onPress={onApplyPress}
              buttonBg={dynamicStyles?.primaryColor ?? '#007bff'}
              btnWidth="45%"
              titleTextColor={dynamicStyles?.secondaryColor ?? '#fff'}
            />
            <CustomButton
              title={translate ? translate('clear') : 'Clear'}
              onPress={onClearPress}
              buttonBg="#ccc"
              btnWidth="45%"
              titleTextColor="#000"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RedemptionHistoryFilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const stylesCustom = StyleSheet.create({
  width45: { width: '45%' },
});
