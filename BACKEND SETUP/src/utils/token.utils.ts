import jwt from "jsonwebtoken";


export const GENERATE_TOKEN_UTILS = (content:Object,secretValue:string,days:number) => {
    return jwt.sign(content as object,secretValue,{expiresIn:`${days}d`});
}

export const verifyToken = (token:string,secretValue:string) => {
    return jwt.verify(token,secretValue);
}

export const decodeToken = (token:string) => {
    return jwt.decode(token);
}

// export const refreshToken = (token:string,secretValue:string) => {
//     return jwt.refresh(token,secretValue);
// }

// export const decodeRefreshToken = (token:string) => {
//     return jwt.decode(token);
// }
