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

// Here we check for the mail subject, but if it is missing
// we do not need to exit. Instead we use a fallback value.
const subjectValue =
  process.env.MAIL_SUBJECT || "Fallback value - check your env!";

// Here we set the SendGrid API key
sgMail.setApiKey(apiKey);

// Here we concatenate our file paths for the CSV files
const filePath = path.join(__dirname + "/validEmails.csv");
const bouncePath = path.join(__dirname + "/bouncedEmails.csv");

// Use a global variable for the bounced list because
// readFile returns void
let bounceList: string[];

// Read through the bounce list, parse into array
readFile(bouncePath, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  bounceList = data.split("\n").slice(1);
});

// This is where we start reading the file!
readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Here we parse the data into an object array
  const emailList = data
    .split("\n")
    .slice(1)
    .map((el) => {
      const [email, unsubscribeId] = el.split(",");
      return { email, unsubscribeId };
    });

  // Here we iterate through the emailList array
  emailList.forEach((user) => {
    // Here we check if the email has been bounced
    if (bounceList.includes(user.email)) {
      console.info(`Message send skipped: ${user.email}`);
      return;
    }

    // This is the message object SendGrid needs
    const message: MailDataRequired = {
      to: user.email,
      from: fromAddress,
      subject: subjectValue,
      text: "This goes away!",
      templateId: sgTemplate,
      dynamicTemplateData: {
        subject: subjectValue,
        unsubscribeId: user.unsubscribeId,
      },
    };

    // Here we send the message we just constructed!
    sgMail
      .send(message)
      .then(() => {
        // Here we log successful send requests
        console.info(`Message send success: ${user.email}`);
      })
      .catch((err) => {
        // Here we log errored send requests
        console.error(err);
        console.error(`Message send failed: ${user.email}`);
      });
  });
});
