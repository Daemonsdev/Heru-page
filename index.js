const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'pagebot';
const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8').trim();

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Handle incoming messages or postbacks
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      // Handling "Get Started" payload
      if (webhookEvent.postback && webhookEvent.postback.payload === 'GET_STARTED_PAYLOAD') {
        await typingIndicator(senderId); // Show typing indicator
        await sendMessage(senderId, 'Welcome! How can I assist you today?');
        await sendQuickReplies(senderId); // Send quick replies after the welcome message
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Function to send a message
async function sendMessage(senderId, message) {
  try {
    await axios.post('https://graph.facebook.com/v13.0/me/messages', {
      recipient: { id: senderId },
      message: typeof message === 'string' ? { text: message } : message,
    }, {
      params: { access_token: PAGE_ACCESS_TOKEN },
    });
    console.log(`Message sent to ${senderId}`);
  } catch (error) {
    console.error('Error sending message:', error.message);
  }
}

// Function to show typing indicator
async function typingIndicator(senderId) {
  try {
    await axios.post(`https://graph.facebook.com/v13.0/me/messages`, {
      recipient: { id: senderId },
      sender_action: 'typing_on',
    }, {
      params: { access_token: PAGE_ACCESS_TOKEN },
    });
    console.log('Typing indicator sent to', senderId);
  } catch (error) {
    console.error('Error sending typing indicator:', error.message);
  }
}

// Function to send quick replies
async function sendQuickReplies(senderId) {
  const quickReplies = [
    {
      content_type: "text",
      title: "Get Help",
      payload: "GET_HELP",
    },
    {
      content_type: "text",
      title: "Ask AI",
      payload: "ASK_AI",
    },
  ];

  await sendMessage(senderId, {
    text: "What would you like to do?",
    quick_replies: quickReplies,
  });
}

// Function to load "Get Started" button
const setupGetStartedButton = async () => {
  try {
    const response = await axios.post(`https://graph.facebook.com/v13.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`, {
      get_started: {
        payload: "GET_STARTED_PAYLOAD"  // Set the payload for the Get Started button
      }
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.data.result === "success") {
      console.log('Get Started button set up successfully!');
    } else {
      console.log('Failed to set up Get Started button.');
    }
  } catch (error) {
    console.error('Error setting up Get Started button:', error);
  }
};

// Set up the "Get Started" button when the server starts
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  setupGetStartedButton(); // Set up the "Get Started" button on server start
  loadMenuCommands();
});
  
