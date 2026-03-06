import bcrypt from "bcrypt";

export const HASHPASSWORD_UTILS = async (password:string,salt:string) => {
    return await bcrypt.hash(password,10);

}

export const COMPARE_PASSWORD_UTILS = async (password:string,hashedPassword:string) => {
    return await bcrypt.compare(password,hashedPassword);
}

export const GENERATESALT_UTILS = async (round:number) => {
    return await  bcrypt.genSalt(round);
}