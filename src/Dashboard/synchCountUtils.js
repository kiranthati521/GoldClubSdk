import { setUpdateOfflineCount } from "../redux/store/slices/updateCountofflineSlice";
import Realm from "realm";

const realm = new Realm({ path: "User.realm" });

const getParsedJsonFieldCount = (realm, tableName, fieldName) => {
    try {
        const result = realm.objects(tableName);
        const rawData = result?.[0]?.[fieldName];
        console.log(`${tableName} records:`, rawData);
        if (!rawData) return 0;

        const parsed = JSON.parse(rawData);
        if (Array.isArray(parsed)) return parsed.length;
        if (typeof parsed === 'object') return 1;

        return 0;
    } catch (e) {
        console.error(`Error parsing field ${fieldName} from ${tableName}:`, e);
        return 0;
    }
};

const getRealmTableCount = (realm, tableName) => {
    try {
        const results = realm.objects(tableName);
        console.log(`${tableName} records:`, results);

        return results.length || 0;
    } catch (e) {
        console.error(`Error reading from table "${tableName}":`, e);
        return 0;
    }
};

const getTotalQrCodeScanCount = (data) => {
    console.log("asassas", JSON.stringify(data))
    let count = 0;

    for (const item of data) {
        count += item.qrCodeScanData.length;
    }
    console.log("Total QR Code count:", count);
    console.log("sasaas", count)
    return count;
};





export const updateOfflineCount = async (dispatch) => {
    try {
        // const seedCalcRes = realm.objects("SeedCalSubmit");
        // const seedCalcCount = seedCalcRes?.[0] || 0;
        // console.log("seedCalcCount==>", JSON.stringify(seedCalcCount))
        // console.log("seedCalcCount", seedCalcCount.length)

        // const yieldCalcRes = realm.objects("YieldCalSubmit");
        // const yieldCalcCount = yieldCalcRes?.[0]?.data?.length || 0;

        const seedCalcCount = getRealmTableCount(realm, "SeedCalSubmit");
        const yieldCalcCount = getParsedJsonFieldCount(realm, "YieldCalSubmit", "data");

        const retailerRaw = realm.objects("finalRetailerEntries");
        const retailerJson = retailerRaw?.[0]?.finalRetailerEntriesData || "[]";
        const retailerCount = JSON.parse(retailerJson)?.length || 0;

        const complaintCount = realm.objects("ComplaintData")?.length || 0;
        console.log("complaintCount", complaintCount)

        const scannedCouponsJSON = realm.objects("scannedCoupons");
        console.log("scannedCouponsCount>>>", JSON.stringify(scannedCouponsJSON))
        const scannedCount = getTotalQrCodeScanCount(scannedCouponsJSON)

        console.log("fjkfjkdjfdkjf=>", seedCalcCount + " " + yieldCalcCount + " " + retailerCount + " " + complaintCount + " " + scannedCount)
        const totalCount = seedCalcCount + yieldCalcCount + retailerCount + complaintCount + scannedCount;
        console.log("totalCount", totalCount)
        dispatch(setUpdateOfflineCount(totalCount));
    } catch (error) {
        console.error("Error in updateOfflineCount:", error);
        dispatch(setUpdateOfflineCount(0));
    }
};


