const axios = require("axios");

exports.sendVerificationCode = async (phoneNumber, otp) => {
  const formattedNumber = phoneNumber.startsWith("+")
    ? phoneNumber.substring(1)
    : phoneNumber;

  console.log("Sending OTP to:", formattedNumber);

  try {
    const response = await axios({
      url: "https://graph.facebook.com/v22.0/546550445212498/messages",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to: formattedNumber,
        type: "template",
        template: {
          name: "otp_message",
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
          ],
        },
      },
    });

    console.log("WhatsApp API Response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("WhatsApp API Error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else {
      console.error("Error sending OTP:", error.message);
    }
    throw error;
  }
};

exports.sendProfileUpdateReminder = async (phoneNumber, customerName) => {
  const formattedNumber = phoneNumber.startsWith("+")
    ? phoneNumber.substring(1)
    : phoneNumber;

  console.log("Sending profile update reminder to:", formattedNumber);

  try {
    const response = await axios({
      url: "https://graph.facebook.com/v22.0/546550445212498/messages",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to: formattedNumber,
        type: "template",
        template: {
          name: "profile_update",
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: customerName,
                },
                {
                  type: "text",
                  text: `${process.env.CLIENT_URL}/student/update-profile`,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: `${process.env.CLIENT_URL}/student/update-profile`,
                },
              ],
            },
          ],
        },
      },
    });

    console.log("WhatsApp API Response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("WhatsApp API Error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else {
      console.error("Error sending profile update reminder:", error.message);
    }
    throw error;
  }
};
