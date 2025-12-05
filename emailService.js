// emailService.js
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const senderEmail = process.env.BREVO_SENDER_EMAIL;

async function sendEmail({ toEmail, subject, htmlContent }) {
    console.log(`-> 📧 Tentando enviar email para: ${toEmail}`);
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { email: senderEmail, name: 'Plataforma de Cursos' };
    sendSmtpEmail.to = [{ email: toEmail }];

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`-> ✅ Email enviado com sucesso para ${toEmail}. ID: ${data.messageId}`);
        return true;
    } catch (error) {
        console.error(`-> ❌ Erro ao enviar email para ${toEmail}:`, error.response ? error.response.text : error.message);
        return false;
    }
}

module.exports = { sendEmail };
