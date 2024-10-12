const request = require('request');

function sendMessage(senderId, message, pageAccessToken) {
  if (!message || (!message.text && !message.attachment && !message.quick_replies)) {
    console.error('Error: Message must provide valid text, attachment, or quick replies.');
    return;
  }

  const payload = {
    recipient: { id: senderId },
    message: {}
  };

  if (message.text) {
    payload.message.text = message.text;
  }

  if (message.attachment) {
    payload.message.attachment = message.attachment;
  } else {
    // Add the Playsbot Privacy Policy attachment if no other attachment is provided
    payload.message.attachment = {
      type: 'template',
      payload: {
        template_type: 'button',
        text: `To read the Playsbot Privacy Policy, please read the Privacy Policy and how we process your data:\nhttps://playsbotv2.kenliejugarap.com/privacy_policy/`,
        buttons: [
          {
            type: 'web_url',
            url: `https://playsbotv2.kenliejugarap.com/privacy_policy/`,
            title: 'Privacy Policy'
          }
        ]
      }
    };
  }

  if (message.quick_replies) {
    payload.message.quick_replies = message.quick_replies.map(reply => ({
      content_type: 'text',
      title: reply.title,
      payload: reply.payload,
    }));
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
          
