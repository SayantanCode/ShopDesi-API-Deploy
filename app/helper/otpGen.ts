// alphanumaric OTP with length 6
const otpGenerator = ({ length = 6, alphanumaric = true}: {length?: number, alphanumaric?: boolean}={}) => {
    const chars = alphanumaric ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" : "0123456789";
    let OTP = "";
    for (let i = 0; i < length; i++) {
        OTP += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return OTP;
}

export default otpGenerator