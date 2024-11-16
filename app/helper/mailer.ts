import nodemailer from "nodemailer";

const sendEmail = async ({email, subject, text, html}: {email: string, subject: string, text?: string, html?: string}) => {
    try {
        if(!text && !html) {
            throw new Error("Please provide text or html")
        }
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.MAIL_USERNAME, 
        to: email,
        subject: subject,
        text: text,
        html: html
    };
    await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}


export default sendEmail
