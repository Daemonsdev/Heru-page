const request = require('request');

function sendMessage(senderId, message, pageAccessToken) {
  if (!message || (!message.text && !message.attachment && !message.buttons)) {
    console.error('Error: Message must provide valid text, attachment, or buttons.');
    return;
  }

  const payload = {
    recipient: { id: senderId },
    message: {}
  };

  if (message.text && !message.buttons) {
    payload.message.text = message.text;
  }

  if (message.attachment) {
    payload.message.attachment = message.attachment;
  }

  // Check if buttons are present and format them correctly
  if (message.buttons) {
    payload.message.attachment = {
      type: 'template',
      payload: {
        template_type: 'button',
        text: message.text,
        buttons: message.buttons
      }
    };
  }

  request({
    url: 'https://graph.facebook.com/v13.0/me/messages',
    qs: { access_token: pageAccessToken },
    method: 'POST',
    json: payload,
  }, (error, response, body) => {
    if (error) {
      console.error('Error sending message:', error);
    } else if (response.body.error) {
      console.error('Error response:', response.body.error);
    } else {
      console.log('Message sent successfully:', body);
    }
  });
}

module.exports = { sendMessage };
