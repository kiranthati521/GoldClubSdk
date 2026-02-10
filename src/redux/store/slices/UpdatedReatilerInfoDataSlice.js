import { createSlice } from '@reduxjs/toolkit'

// {  sample data which is storing (added for ref)
//   activeRetailers: 0,
//   address: 'Unnamed Road, Gawaloo, Mundwa, Nagaur District, Rajasthan. Pin-341028 (India)',
//   bonusPointsFlag: false,
//   companyCode: '1400',
//   companyLogoPath: 'http://3.110.159.82:8080/vyapar_mitra/CompanyIcons/PABLLogo.png',
//   companyName: 'Prabhat Agri Bio-tech',
//   countryId: 1,
//   countryName: 'INDIA',
//   createdOn: '2025-04-02 11:28:48.766',
//   customerId: 0,
//   customerSyncStatus: false,
//   deviceId: 'b09ec944f12a5a39',
//   deviceToken: '""',
//   deviceType: 'android',
//   disableColor: '#8E8A91',
//   districtId: 344,
//   districtName: 'Nagaur',
//   ekycStatus: 'Approve',
//   fcmToken: 'c1M_vbZVRpy5PiT3cdwJtm:APA91bGSQD975COqLpB1gn0urlIau9eCX6i64W476Ih_QjvKJ-uim8CLNnU7mA2up4phpTUh1lY1Orb8Z1EMA6LOafWGRAFe6jflDLY7c1x-LO0siJIFJB4',
//   firmName: 'Hv',
//   forceUpdate: false,
//   iconPrimaryColor: '#8E40BA',
//   id: 47892,
//   landMark: 'Hi',
//   loaderPath: 'http://3.110.159.82:8080/vyapar_mitra/CompanysIconLoader/PrabhatSeedsLoader.gif',
//   loggedInFirstTime: false,
//   mandatoryUpdate: false,
//   maritalStatus: '',
//   marriageAnniversary: '',
//   memeberPoints: 0,
//   mobileNumber: '8000000000',
//   modifiedOn: '2025-05-19 15:06:39.476',
//   noOfBagsScanned: 0,
//   noOfCouponsScanned: 0,
//   pincode: '341028',
//   pointsEarned: 0,
//   primaryColor: '#8E40BA',
//   proprietorName: 'Ch',
//   quantityInTons: 0,
//   redeemPoints: 0,
//   registeredThrough: 'android',
//   remarks: '',
//   retailersCount: 0,
//   roleId: 6,
//   roleName: 'Retailer',
//   scanBonusPoints: 0,
//   secondaryColor: '#FFFFFF',
//   signUpBonus: 0,
//   stateId: 5,
//   stateName: 'Rajasthan',
//   status: true,
//   storeName: 'Hv',
//   termsAndConditionsAccepted: false,
//   textColor: '#000000',
//   totalPoints: 0,
//   userMenuControl: [ [Function: Array] ],
//   userPointsEarned: 750,
//   userPointsReedemed: 0
// }

// === Code Execution Successful ===

const initialState = {
  value: {},
};

export const UpdatedReatilerInfoDataSlice = createSlice({
  name: "updated_retailerinfo_data",
  initialState,
  reducers: {
    updateRetailerInfoData: (state, action) => {
        state.value = action.payload
      }
  },
})


export const { updateRetailerInfoData } = UpdatedReatilerInfoDataSlice.actions

export const getUpdateRetailerInfoData = (state) => state.updated_retailerinfo_data

export default UpdatedReatilerInfoDataSlice.reducer

