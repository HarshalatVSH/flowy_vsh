import * as InboxSDK from "@inboxsdk/core";
import MessageView from "@inboxsdk/core/src/platform-implementation-js/views/conversations/message-view";
import ThreadView from "@inboxsdk/core/src/platform-implementation-js/views/conversations/thread-view";

const appId = "sdk_hello_aap_02fce3eb5c";
const opts = {}; // You can customize the options as needed
let emailContent: any = {};

InboxSDK.load(2, appId, opts).then((sdk) => {
  sdk.Conversations.registerThreadViewHandler((threadView) => {
    let allMessages = threadView.getMessageViewsAll();
    let subject = threadView.getSubject();
    emailContent.subject = subject;
    allMessages.forEach((messageView) => {
      const sender = messageView.getSender();
      const recipients = messageView.getRecipientsFull().then((res) => {
        emailContent.recipients = res;
      });
      const body = messageView.getBodyElement();
      const getThreadViewMesg = messageView.getThreadView();
      const getAttachment = messageView.getFileAttachmentCardViews();
      const getEventNames = messageView.eventNames();
      console.log(sender);
      console.log(recipients);
      console.log(body.innerText);
      console.log(getThreadViewMesg);
      console.log(getAttachment);
      console.log(getEventNames);
      emailContent.sender = sender;
      emailContent.recipients = recipients;
      emailContent.body = body;
      emailContent.getThreadViewMesg = getThreadViewMesg;
      emailContent.getAttachment = getAttachment;
      emailContent.getEventNames = getEventNames;
    });
  });
  sdk.Toolbars.registerThreadButton({
    title: "Flowy Magic",
    iconUrl:
      "https://lh5.googleusercontent.com/itq66nh65lfCick8cJ-OPuqZ8OUDTIxjCc25dkc4WUT1JG8XG3z6-eboCu63_uDXSqMnLRdlvQ=s128-h128-e365",
    onClick: (_event) => {
      // window.open(
      //   "https://calendar.google.com/calendar/render?action=TEMPLATE",
      //   "_blank"
      // );
      const postData = [
        {
          subject: emailContent.subject,
          body: emailContent.body.innerText,
          to: emailContent.recipients[0].emailAddress,
          cc: 'dummy@gmail.com',
          bcc: 'dummy2@gmail.com',
          from_: emailContent.sender.emailAddress,
          sent_at: Date.now(),
          attachments: ["string"],
        },
      ];

      chrome.runtime.sendMessage({action: "callApi", data: postData})
      const apiUrl =
        "https://app.flowyai.net/apicalendar/emailtocalendar2?debug=true";
      const apiKey = "calendar_api_key";

     

      // fetch(apiUrl, {
      //   method: "POST",
      //   headers: {
      //     Accept: "application/json",
      //     "Content-Type": "application/json",
      //     "x-api-key": apiKey,
      //   },
      //   body: JSON.stringify(postData),
      // })
      //   .then((response) => response.json())
      //   .then((data) => console.log(data, 'data recieved form api'))
      //   .catch((error) => console.error("Error:", error));
      // window.open(
      //   `https://www.google.com/calendar/render?action=TEMPLATE&text=${emailContent.subject}&details=${emailContent.body.innerText}&location=Pune&dates=20240113T032600Z%2F20240113T033000Z`,
      //   "_blank"
      // );
    },
    hasDropdown: false,
  });
});
// InboxSDK.load(2, appId, opts).then((sdk) => {

// });
