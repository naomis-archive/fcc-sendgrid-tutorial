import dotenv from "dotenv";
dotenv.config();
import sgMail, { MailDataRequired } from "@sendgrid/mail";
import path from "path";
import { createWriteStream, readFile } from "fs";

// Here we check for a valid API key
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  console.error("Missing SendGrid Key");
  process.exit(1);
}

// Here we check for a valid from address
const fromAddress = process.env.SENDGRID_FROM;
if (!fromAddress) {
  console.error("Missing sender email address!");
  process.exit(1);
}

// Here we check for a dynamic template ID
const sgTemplate = process.env.SENDGRID_TEMPLATE_ID;
if (!sgTemplate) {
  console.error("Missing SendGrid Template ID");
  process.exit(1);
}

// Here we set the SendGrid API key
sgMail.setApiKey(apiKey);

// Here we check for the mail subject, but if it is missing
// we do not need to exit. Instead we use a fallback value.
const subjectValue = process.env.MAIL_SUBJECT || "Fallback value - check your env!";

// Here we concatenate our file path for the valid email file
const filePath = path.join(__dirname + "/validEmails.csv");

// This is where we start reading the file!
readFile(filePath, "utf8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(data)
});