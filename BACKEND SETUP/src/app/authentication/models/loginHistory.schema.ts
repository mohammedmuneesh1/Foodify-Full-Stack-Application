import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    deviceInfo:{
        deviceType:String,
        browser:String,
        version:String,
        os:String,
        platform:String,
        isBot:String ,
        source:String,
    },
    geoLocationData:{
        country:String,
        country_code:String,
        longitude:String,
        latitude:String,
        postal:String,
        calling_code:String,
        capital:String,
        ipInfo:{
            ipAddress:String,
            ipType:String,
        },
        
        flag:{
            img:String,
            emoji:String,
            emoji_unicode:String
        },
        connection:{
            asn:String,
            isp:String,
            org:String,
            domain:String,
        },
        timezone: {
            id:String,
            abbr: String,
            is_dst: Boolean,
            offset: String,
            utc:String,
            current_time:String,
        }
    },
    loginTime:Date,
    logoutTime:Date,
    isLogout:{
        type:Boolean,
        default:false,
    },
    isBlacklisted: {
        type: Boolean,
        default: false,  // False means not blacklisted
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    hashedToken: {
        type: String,  // The hashed JWT token
        required: true,
    },
});

const LoginHistoryModel = mongoose.models?.LoginHistory || mongoose.model("LoginHistory", loginHistorySchema);
export default LoginHistoryModel;

// const result = await axios.get(`https://ipwho.is/${userIpAddress}`);
// const data = result.data;

// {
//     "About Us": "https:\/\/ipwhois.io",
//     "ip": "103.42.196.106",
//     "success": true,
//     "type": "IPv4",
//     "continent": "Asia",
//     "continent_code": "AS",
//     "country": "India",
//     "country_code": "IN",
//     "region": "Kerala",
//     "region_code": "KL",
//     "city": "Malappuram",
//     "latitude": 11.0731819,
//     "longitude": 76.0739999,
//     "is_eu": false,
//     "postal": "673642",
//     "calling_code": "91",
//     "capital": "New Delhi",
//     "borders": "BD,BT,CN,MM,NP,PK",
//     "flag": {
//         "img": "https:\/\/cdn.ipwhois.io\/flags\/in.svg",
//         "emoji": "\ud83c\uddee\ud83c\uddf3",
//         "emoji_unicode": "U+1F1EE U+1F1F3"
//     },
//     "connection": {
//         "asn": 138754,
//         "org": "Kottayam Cable Channel Distributors Pvt LTD",
//         "isp": "Kerala Vision Broad Band Private Limited",
//         "domain": "cometwifi.com"
//     },
//     "timezone": {
//         "id": "Asia\/Calcutta",
//         "abbr": "IST",
//         "is_dst": false,
//         "offset": 19800,
//         "utc": "+05:30",
//         "current_time": "2025-05-02T22:03:09+05:30"
//     }
// }