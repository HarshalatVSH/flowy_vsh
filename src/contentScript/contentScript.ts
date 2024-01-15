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
      emailContent.attachments = [];
      getAttachment.forEach((attachmentView) => {
        emailContent.attachments.push(attachmentView.getTitle());
        console.log(emailContent.attachments);
      });
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
      const postData = [
        {
          subject: emailContent.subject,
          body: emailContent.body.innerText,
          to: emailContent.recipients.map((el) => el.emailAddress),
          from_: emailContent.sender.emailAddress,
          sent_at: Date.now().toLocaleString(),
          attachments: emailContent.attachments,
        },
      ];

      chrome.runtime.sendMessage({ action: "callApi", data: postData });
    },
    hasDropdown: false,
  });
});
// InboxSDK.load(2, appId, opts).then((sdk) => {

// });
