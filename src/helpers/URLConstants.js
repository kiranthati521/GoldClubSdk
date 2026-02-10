export const ANDROID_STORE_LINK = "https://play.google.com/store/apps/details?id=com.nuziveeduseeds.nslchannel";
export const IOS_STORE_LINK = "https://apps.apple.com/us/app/nsl-gold-club/id6748138634";

export const FIREBASE_LOG = true;
// export const APP_ENV_PROD = false // UAT
export const APP_ENV_PROD = true; // Live
export const LOCAL_SERVER = '';
// Informational responses (1xx)
export const HTTP_CONTINUE = 100;
export const HTTP_SWITCHING_PROTOCOLS = 101;
export const HTTP_PROCESSING = 102;

// Successful responses (2xx)
export const HTTP_OK = 200;
export const HTTP_CREATED = 201;
export const HTTP_ACCEPTED = 202;
export const HTTP_NON_AUTHORITATIVE_INFORMATION = 203;
export const HTTP_NO_CONTENT = 204;
export const HTTP_RESET_CONTENT = 205;
export const HTTP_PARTIAL_CONTENT = 206;

// Redirection messages (3xx)
export const HTTP_MULTIPLE_CHOICES = 300;
export const HTTP_MOVED_PERMANENTLY = 301;
export const HTTP_FOUND = 302;
export const HTTP_SEE_OTHER = 303;
export const HTTP_NOT_MODIFIED = 304;
export const HTTP_USE_PROXY = 305;
export const HTTP_UNUSED = 306;
export const HTTP_TEMPORARY_REDIRECT = 307;
export const HTTP_PERMANENT_REDIRECT = 308;

// Client error responses (4xx)
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_PAYMENT_REQUIRED = 402;
export const HTTP_FORBIDDEN = 403;
export const HTTP_NOT_FOUND = 404;
export const HTTP_METHOD_NOT_ALLOWED = 405;
export const HTTP_NOT_ACCEPTABLE = 406;
export const HTTP_PROXY_AUTHENTICATION_REQUIRED = 407;
export const HTTP_REQUEST_TIMEOUT = 408;
export const HTTP_CONFLICT = 409;
export const HTTP_GONE = 410;
export const HTTP_LENGTH_REQUIRED = 411;
export const HTTP_PRECONDITION_FAILED = 412;
export const HTTP_PAYLOAD_TOO_LARGE = 413;
export const HTTP_URI_TOO_LONG = 414;
export const HTTP_UNSUPPORTED_MEDIA_TYPE = 415;
export const HTTP_RANGE_NOT_SATISFIABLE = 416;
export const HTTP_EXPECTATION_FAILED = 417;
export const HTTP_I_AM_A_TEAPOT = 418;
export const HTTP_MISDIRECTED_REQUEST = 421;
export const HTTP_UNPROCESSABLE_ENTITY = 422;
export const HTTP_LOCKED = 423;
export const HTTP_FAILED_DEPENDENCY = 424;
export const HTTP_UPGRADE_REQUIRED = 426;
export const HTTP_PRECONDITION_REQUIRED = 428;
export const HTTP_TOO_MANY_REQUESTS = 429;
export const HTTP_REQUEST_HEADER_FIELDS_TOO_LARGE = 431;
export const HTTP_UNAVAILABLE_FOR_LEGAL_REASONS = 451;

// Server error responses (5xx)
export const HTTP_INTERNAL_SERVER_ERROR = 500;
export const HTTP_NOT_IMPLEMENTED = 501;
export const HTTP_BAD_GATEWAY = 502;
export const HTTP_SERVICE_UNAVAILABLE = 503;
export const HTTP_GATEWAY_TIMEOUT = 504;
export const HTTP_HTTP_VERSION_NOT_SUPPORTED = 505;
export const HTTP_VARIANT_ALSO_NEGOTIATES = 506;
export const HTTP_INSUFFICIENT_STORAGE = 507;
export const HTTP_LOOP_DETECTED = 508;
export const HTTP_NOT_EXTENDED = 510;
export const HTTP_NETWORK_AUTHENTICATION_REQUIRED = 511;

export const SECOND_LOGIN = 103;
export const MAP_MY_INDIA_KEY = "5zf2txekry89tciw19sgmjpo7w133ioj";
export const YOUR_MAPMYINDIA_REST_API_KEY = "5zf2txekry89tciw19sgmjpo7w133ioj";
export const MAP_MY_INDIA_URL = `https://apis.mapmyindia.com/advancedmaps/v1/${MAP_MY_INDIA_KEY}/rev_geocode`

export const FIREBASE_VERSION_COLLECTION_NAME = "getAppVersion"
export const FIREBASE_VERSION_DOC_ID = "OXbbvOZlBVnKgcIj19Qw"

export const configs = {
    BASE_URL: APP_ENV_PROD ? 'https://nvmretailpro.com:8443/rest/nsl/' : 'http://3.110.159.82:8080/vyapar_mitra/rest/nsl/',
    TERMS_CONDIOTNS_URL: APP_ENV_PROD ? "https://nvmretailpro.com/Terms-conditions.html" : "http://nvmuat.empover.com:8080/Terms-conditions.html",
    PRIVACY_POLICY_URL: "http://nvmuat.empover.com:8080/Privacy-Policy.html",
    SUBEEJ_BASE_URL: APP_ENV_PROD ? 'https://subeejkisan.com:8443/rest/' : 'http://3.110.159.82:8080/subeejkisan/rest/',
    //  ACCOUNT_CLOSE_URL : (mobileNumber) => APP_ENV_PROD ? `http://nvmuat.empover.com/nsl/accountClosure?mobileNumber=${mobileNumber}` : `http://nvmuat.empover.com/nsl/accountClosure?mobileNumber=${mobileNumber}`,

    ACCOUNT_CLOSE_URL: ({ mobileNumber, languageId, buttonColor }) => {
        const baseUrl = APP_ENV_PROD ? 'https://nvmretailpro.com/nsl/' : 'http://nvmuat.empover.com/nsl/';
        const url = `${baseUrl}accountClosure?mobileNumber=${mobileNumber}&languageId=${languageId}&buttonColor=${encodeURIComponent(buttonColor)}`;
        return url;
    },

    AUTH: {
        SEND_OTP: 'sendOTP',
        VERIFY_OTP: 'validateOTP',
        RESEND_OTP: 'reSendOTP',
        SIGNUP: 'addRetailer',
        FORCE_UPDATE: 'Login/ForceUpdate',
        LOGOUT: 'forceLogout',
        CHECK_TERMS: 'checkTermsAndConditions',
        getTermsConditionsAndPrivacyPolicy: 'getTermsConditionsAndPrivacyPolicy',
    },
    MANDRIPRICES: {
        GETSTATEDISTRICTDETAILS: 'getMastersForMandiPrices',
        GETMANDIPRICES: 'mandiPrices/getMandiPrices',
        BOOKMARKSAVE: "mandiPrices/bookMarkDetailsForMandiMarket",
        getMandiPricesAnalysisReport_V1: 'mandiPrices/getMandiPricesAnalysisReport_V1',
        getDistricts: "masters/getDistricts",
        getAllStates: "masters/getAllStates",
    },
    MASTERS: {
        // DASHBOARD_MASTER: 'getDashBoardDetailes',
        // DASHBOARD_MASTER: 'getDashBoardDetailes_v2', // prev one before static visibilty in gc.
        // DASHBOARD_MASTER: 'getDashBoardDetailes_v3',
        DASHBOARD_MASTER: 'getDashBoardDetailes_v4',
        getWeatherDetails: 'getWeatherDetails',
        // getWeatherDetailsV1:'getWeatherDetailsV1', //before ios versioning for weather
        getWeatherDetailsV1: 'getWeatherDetailsV2',
        getPestInformation: "getPestInformation",
        KYCBYPASS: 'raiseRequestForByPass',
        FAQ_DETAILS: 'getFAQs',
        GET_TM: 'getTerritoryManagerByDistrictId',
        GET_MDO: 'getMdoManagerByDistrictId',
        USER_MASTERS: 'getUserSupportedMasters',
        COUNTRIES_MASTERS: 'masters/getCountries',
        ACTIVE_HYBRIDS: 'masters/getActiveHybrids',
        FLASH_MASTERS: 'masters/getFlashScreens',
        SEASON_MASTERS: 'masters/getSeasons',
        getCropsAndSeasonsForAgronomy: "getCropsAndSeasonsForAgronomy",// before date changes data in agronomy
        // getCropsAndSeasonsForAgronomy:"getCropsAndSeasonsForAgronomy_V1",// after versioning new End Point
        getAgronomyInfo: "getAgronomyInfo_v1",
        FILTER_SEASON: 'masters/getActiveSeasons',
        GET_KYC_DETAILS: 'getEkycDetails',
        GET_ALL_COMPANIES: 'masters/getAllCompanies',
        PROGRAMDETAILSBROCHURE: 'ProgramDetailsController',
        GET_ALL_LOCATIONS: 'masters/getAllLocations',
        GETCAROUSELDATA: 'notifications/getNotificationDetailsBasedOnType',
        GETALLCROPSLIST: 'masters/getNslCrops',
        getYearDropDown: 'getYearDropDown',
        getAllSurveys: 'dipstick/getAllSurveys_v1',
        GETLANGUAGES: 'masters/getAllLanguagesForMobile',
        // GETALLCROPSLIST:'masters/getCrops',
    },
    PROFILE: {
        VIEW_PROFILE: 'getRetailer',
        UPDATE_PROFILE: 'updateRetailer',
        UPDATE_EMPLOYEE_PROFILE: "updateEmployee",
        EKYC: 'eKYCByPass',
        EMPLOYEE_PROFILE: "getUserBasedOnIdAndMobileNumber"
    },
    HELPCENTER: {
        CUSTOMER_SUPPORT: 'getMastersForCustomerSupport',
        VIEW_RAISEDCOMPLAINTS: 'getRaisedComplaints',
        // RAISECOMPLAINTS: 'raiseComplaints', // prev api call
        // RAISECOMPLAINTS: 'raiseComplaints_v4',
        RAISECOMPLAINTS: 'raiseComplaints_v5',
        raiseComplaintList: "raiseComplaintList"
    },
    QRSCAN: {
        RETAILERS_MASTERS: 'masters/getRetailerMasterForDropDown',
        VALIDATEQR: 'scanQRCodeDetailes',
        // SCAN_HISTORY: 'getScanHistory',
        PROGRAMS_LIST: "masters/getProgramsDropDown_v1",
        // SCAN_HISTORY_V1:"getScanHistory_v1",
        // SCAN_HISTORY_V2:"getScanHistory_v2",
        SCAN_HISTORY_V3: "getScanHistory_v3",
        SCANNED_PRODUCTS: 'getScanHistoryBycropid',
        SCAN_HIS_BY_PRODUCTS: 'getScanHistoryBycropIdAndproductId',
        SCAN_HISTORY_EMPLOYEE: 'reports/retailerScanHistoryForMobileGrid',
        SCANNED_PRODUCTS_EMPLOYEE: 'reports/getProductScanHistoryByCropNameForMobileGrid',
        SCAN_HIS_BY_PRODUCTS_EMPLOYEE: 'reports/getProductScanHistoryByProductNameForMobileGrid',
        // getRetailerScanHistoryForTotalPoints: "reports/getRetailerScanHistoryForTotalPoints",
        // getRetailerScanHistoryForTotalPoints: "reports/getRetailerScanHistoryForTotalPoints_v1",
        getRetailerScanHistoryForTotalPoints: "reports/getRetailerScanHistoryForTotalPoints_v2",
        DROPDOWNS_MASTERS: 'masters/getMasterDataForDropDowns',
        // VALIDATEQR_V2: 'scanQRCodeDetailes_v2', // previous link for qr scan
        // VALIDATEQR_V6: 'scanQRCodeDetailes_v6',// previous link for qr scan at 11 -06-2025 build
        // VALIDATEQR_V7: 'scanQRCodeDetailes_v7',
        VALIDATEQR_V9: 'scanQRCodeDetailes_v9',
        GET_RETAILER_COUPON_SCANNED_COMPANYS_DETAILS: "getRetailerCouponScannedCompanysDetails",
        GET_RETAILER_REDEMPTION_COMPANYS_DETAILS: "getRetailerRedeemtionCompanysDetails",
        NEWGENUNITYURL: "scan/genuinityCheckForProductAuthentication",
        MDOSCAN: "scanMdoQrCodeDetailes"
    },
    PRODUCTS: {
        PRODUCTS_MASTERS: 'masters/getActiveProducts',
        PRODUCTS_MASTERSV1: "masters/getActiveProducts_V1",
        getCropMasterByCompanayCode: 'masters/getCropMasterByCompanayCode',
    },
    PROMOTIONS: {
        PROMOTIONS_MASTERS: 'masters/getPromotionsByseasonId',
    },
    NOTIFICATIONS: {
        GET_NOTIFICATIONS: 'viewNotifications',
        READ_NOTIFICATION: 'readNotification',
        DELETE_NOTIFICATION: 'deleteNotification',
    },
    REDEEM: {
        REDEEM_CARTPOINTS: 'redeemCartPoints',
        REDEEM_ADDCART: 'addCartDetailes',
        REDEEM_GET_MASTER: 'getRedeemCartDetailes',
        REDEEM_GET_CART: 'getCartDetailes',
        REDEEM_COUNT: 'getRetailerPointsDashBoard',
        GET_REWARD_POINTS: "getRewardPoints",
        UPDATED_RETAILER_REDEEM_CARD_AMOUNT: "updateRetailerRedeemCardAmountV2",
        REDEEM_PORTAL: 'RedeemPortalForRetailers',
    },
    REDEMPTION: {
        REDEMPTION_HISTORY: "getRedumptionHistoryDetails",
        // REDEMPTION_HISTORY_SEARCH: "getRedumptionHistoryByTransactionId?searchText={search}",
        REDEMPTION_HISTORY_SEARCH: "getRedumptionHistoryDetails?filterValue={search}",
        EMPLOYEE_REDEEM_HISTORY: 'reports/getRedeemPointsHistoryReports'
    },
    KYCAPPROVAL: {
        GETPENDINGKYC: "getPendingEkycForMobile",
        GETKYCHISTORY: "getKycHistory",
        KYCBULKAPPROVAL: "ekycBulkApproval"
    },
    SALESTEAM: {
        GET_SALES_TEAM: "getSalesTeamGridData"
    },
    PLANNING_TOOL: {
        saveRetailerBusinessPlanningTool: 'saveOrUpdateOrDeleteRetailerBusinessPlanningTool',//saveRetailerBusinessPlanningTool
        getRetailerBusinessPlanningTool: 'getRetailerBusinessPlanningTool',
        getProductBrandsByCompany: 'masters/getProductBrandsByCompany',
        getAllCropMasterWithCompany: "masters/getAllCropMasterWithCompany",
        getProductBrandsForAllCompany: "masters/getProductBrandsForAllCompany",
        getAllCompaniesForDropDown: "masters/getAllCompaniesForDropDown",
        getPestForecastCrops: "getPestForecastCrops",
        getRemedies: "processCropDiseaseRemedy",
        getProgramNames: "getProgramNames"
    },
    CALCULATOR: {
        GETYIELDCALCULATOR: 'getYieldCalculator',
        GETFERTILIZERCALCULATOR: 'getDropdownValuesForFertilizerCalculator',
        getFertilizerCalculatorMaster: 'getFertilizerCalculatorMaster',
        GETYIELDANDSEEDRATES: 'getYieldAndSeedRates',
        getFertilizerDropdownValuesBySelectedData: 'getFertilizerDropdownValuesBySelectedData',
        GETTOTALSEEDREQUIREDKGPERPKT: 'getTotalSeedRequiredKgPerPkt',
        GETEXPECTEDYIELDQTL: 'getExpectedYieldQtl',
        geSeedAndPopulationCaculator: 'geSeedAndPopulationCaculator',
        getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData: 'getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData',
        getIdealPlantPopulationSeedRate: 'getIdealPlantPopulationSeedRate',
        saveYieldCalculator: 'saveYieldCalculator',
        saveSeedAndPopulationCaculator: 'saveSeedAndPopulationCaculator',
    },
    CROPDETECTION: {
        CROPDISEASEIDENTIFICATION: 'processCropDiseaseIdentification',
        CROPDIAGNOSTICHISTORY: 'CropDiseaseIdentificationHistory'
    },
    KNOWLEDGECENTREADVCANCED: {
        getAdvancedKnowledgeCenterDataByCompany: "getAdvancedKnowledgeCenterDataByCompany_v1"
    }

}
