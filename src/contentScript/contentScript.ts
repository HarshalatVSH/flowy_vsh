import * as InboxSDK from "@inboxsdk/core";
import MessageView from "@inboxsdk/core/src/platform-implementation-js/views/conversations/message-view";
import ThreadView from "@inboxsdk/core/src/platform-implementation-js/views/conversations/thread-view";

const appId = "sdk_hello_aap_02fce3eb5c";
const opts = {}; // You can customize the options as needed
let emailContent;
InboxSDK.load(2, appId, opts).then((sdk) => {
  sdk.Toolbars.registerThreadButton({
    title: "Flowy Magic",
    iconUrl:
      "https://lh5.googleusercontent.com/itq66nh65lfCick8cJ-OPuqZ8OUDTIxjCc25dkc4WUT1JG8XG3z6-eboCu63_uDXSqMnLRdlvQ=s128-h128-e365",
    onClick: (_event) => {
      window.open(
        "https://calendar.google.com/calendar/render?action=TEMPLATE",
        "_blank"
      );
    },
    hasDropdown: false,
  });
});
InboxSDK.load(2, appId, opts).then((sdk) => {
  sdk.Conversations.registerThreadViewHandler((threadView) => {
    let allMessages = threadView.getMessageViewsAll();
    allMessages.forEach((messageView) => {
      const sender = messageView.getSender();
      const recipients = messageView.getRecipients();
      const body = messageView.getBodyElement(); // This gets the HTML body element
      const getThreadViewMesg = messageView.isLoaded();
      console.log("Sender:", sender);
      console.log("Recipients:", getThreadViewMesg);
      console.log("Body:", body.textContent); // Use textContent to get the readable text
    });
  });
});
