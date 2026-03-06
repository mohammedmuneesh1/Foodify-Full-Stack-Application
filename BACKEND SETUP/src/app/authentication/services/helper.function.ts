import useragent from 'express-useragent';
import { Request } from 'express';
import axios from 'axios';







export const userDeviceTrackingFn = (req:Request)=>{
   const ua = useragent.parse(req.headers['user-agent'] || '');
   if (!ua) return null;
    const deviceInfo = {
        deviceType:ua.isMobile ? 'mobile' : ua.isTablet ? 'tablet' : 'desktop',
        browser:ua.browser,
        version:ua.version ?? "N/A",
        os:ua.os ?? "N/A",
        platform:ua.platform ?? "N/A",
        isBot:ua.isBot ?? "N/A",
        source:ua.source ?? "N/A",
    }
    return deviceInfo;

}



export const getUserGeoLocationFn =async (req:Request)=>{
const userIpAddress = req.headers['x-forwarded-for']
  ? (req.headers['x-forwarded-for'] as string).split(',')[0].trim()
  : req.socket.remoteAddress || '';

    let ip = userIpAddress === '::1' ? '127.0.0.1' : userIpAddress;
    const geoData = (await axios.get(`https://ipwho.is/${ip}`))?.data;
    console.log('geoData',geoData);
    return geoData
}



//  let ip = userIpAddress === '::1' || userIpAddress === '127.0.0.1' ? '' : userIpAddress;

//   if (!ip) {
//     // fallback for localhost during development
//     return {
//       ip: '127.0.0.1',
//       city: 'Localhost',
//       region: 'Local',
//       country: 'Development',
//       isLocal: true,
//     };
//   }

//NOTE:
// req.socket in this context refers to the underlying network socket used for the connection, not to Socket.IO.


    //     geoLocationData:{
    //     country:String,
    //     country_code:String,
    //     longitude:String,
    //     latitude:String,
    //     postal:String,
    //     calling_code:String,
    //     capital:String,
    //     ipInfo:{
    //         ipAddress:String,
    //         ipType:String,
    //     },
        
    //     flag:{
    //         img:String,
    //         emoji:String,
    //         emoji_unicode:String
    //     },
    //     connection:{
    //         asn:String,
    //         isp:String,
    //         org:String,
    //         domain:String,
    //     },
    //     timezone: {
    //         id:String,
    //         abbr: String,
    //         is_dst: Boolean,
    //         offset: String,
    //         utc:String,
    //         current_time:String,
    //     }
    // },






    // deviceInfo:{
    //     deviceType:String,
    //     browser:String,
    //     os:String,
    //platform:String,
    // },

        //     deviceType: req.useragent.isMobile ? 'mobile' : req.useragent.isTablet ? 'tablet' : 'desktop',


        // platform: req.useragent.platform,
        // };

        // isBot	true if it's a known bot (useful to detect automated logins)

        // version	Browser version (e.g., 110.0.5481.100)