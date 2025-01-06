const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendUserAddedMail = async (to, password) => {
  const loginLink = process.env.CLIENT_URL + `/login/admin`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Account Successfully Created",
    text: `Your account has been successfully created.\n\nPassword: ${password}\n\nPlease log in and change your password as soon as possible.\n\nClick the following link to log in:\n${loginLink}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Created</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #5cb85c;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          margin-top: 20px;
          background-color: #5cb85c;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-size: 16px;
          text-align: center;
        }
        .button:hover {
          background-color: #4cae4c;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Your account has been successfully created!</h2>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please log in and change your password as soon as possible.</p>
        <a href="${loginLink}" class="button">Login and Change Password</a>
      </div>
    </body>
    </html>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("User added mail sent successfully");
  } catch (error) {
    console.error("Error sending user added mail:", error);
  }
};

exports.sendUniversityCreationMail = async (to, universityName, password) => {
  const loginLink = `${process.env.CLIENT_URL}/login/faculty`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "University and Account Successfully Created",
    text: `
      Dear User,

      Congratulations! The university "${universityName}" has been successfully registered, and your account as the Head of the University has been created.

      Your login credentials are as follows:
      - Username: ${to}
      - Password: ${password}

      Please log in using the link below and change your password for security purposes:
      ${loginLink}

      If you have any questions, feel free to reach out to our support team.

      Best regards,
      [Your Organization Name]
    `,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>University and Account Created</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #4CAF50;
          }
          .button {
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
          }
          .button:hover {
            background-color: #45a049;
          }
          p {
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>University and Account Successfully Created!</h2>
          <p>Dear User,</p>
          <p>
            Congratulations! The university "<strong>${universityName}</strong>" has been successfully registered, and your account as the Head of the University has been created.
          </p>
          <p>
            <strong>Your login credentials:</strong><br>
            - Username: ${to}<br>
            - Password: ${password}
          </p>
          <p>Please log in using the link below and change your password for security purposes:</p>
          <a href="${loginLink}" class="button">Login and Change Password</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,</p>
          <p>Smart Recruiter Platform</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("University creation email sent successfully");
  } catch (error) {
    console.error("Error sending university creation email:", error);
  }
};


exports.sendFacultyAccountCreationMail = async (to, password, name) => {
  const loginLink = `${process.env.CLIENT_URL}/login/faculty`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: "Faculty Account Created",
    text: `Dear ${name},

    Congratulations! Your account as a faculty member has been successfully created.

    Your login credentials are as follows:
    - Username: ${to}
    - Password: ${password}

    Please log in using the link below and change your password for security purposes:
    ${loginLink}

    If you have any questions, feel free to reach out to our support team.

    Best regards,
    Campus Recruitment Gateway`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Creation Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #4CAF50;
          }
          .button {
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            display: inline-block;
          }
          .button:hover {
            background-color: #45a049;
          }
          p {
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h2>Account Created Successfully!</h2>
          <p>Dear ${name},</p>
          <p>
            Congratulations! Your account as a faculty member has been successfully created.
          </p>
          <p>
            <strong>Your login credentials:</strong><br>
            - Username: ${to}<br>
            - Password: ${password}
          </p>
          <p>Please log in using the link below and change your password for security purposes:</p>
          <a href="${loginLink}" class="button">Login and Change Password</a>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,</p>
          <p>Campus Recruitment Gateway</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Faculty account creation email sent successfully");
  } catch (error) {
    console.error("Error sending faculty account creation email:", error);
  }
};