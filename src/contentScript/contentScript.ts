import * as InboxSDK from "@inboxsdk/core";
let flowy;
interface Recipient {
  emailAddress: string;
  // Add more recipient properties if needed
}

interface EmailContent {
  subject: string;
  recipients: Recipient[];
  attachments: string[];
  sender: {
    emailAddress: string;
  } | null;
  body: HTMLElement | null;
  cc: string[];
  bcc: string[];
  getThreadViewMesg: string;
  getAttachment: string[];
  getEventNames: string[];
}

const appId = "sdk_hello_aap_02fce3eb5c";
const opts = {};
let emailContent: EmailContent = {
  subject: "",
  recipients: [],
  attachments: [],
  sender: null,
  body: null,
  cc: [],
  bcc: [],
  getThreadViewMesg: null,
  getAttachment: [],
  getEventNames: [],
};

function getPostData() {
  const postData = [
    {
      subject: emailContent.subject,
      body: emailContent.body?.innerText || "",
      cc: emailContent.cc,
      bcc: emailContent.bcc,
      to: emailContent.recipients.map((el) => el.emailAddress),
      from_: emailContent.sender?.emailAddress || "",
      sent_at: new Date().toLocaleString(),
      attachments: emailContent.attachments,
    },
  ];
  return postData;
}

function createButton() {
  const flowyButton = document.createElement("button");
  let image = document.createElement("img");
  image.setAttribute("style", "width: 18px;");
  image.src =
    "https://lh5.googleusercontent.com/itq66nh65lfCick8cJ-OPuqZ8OUDTIxjCc25dkc4WUT1JG8XG3z6-eboCu63_uDXSqMnLRdlvQ=s128-h128-e365";
  flowyButton.appendChild(image);
  flowyButton.setAttribute(
    "style",
    "cursor: pointer;display: flex;align-items: center;gap: 3px;padding: 0 10px 2px 0; background: none; border: none; border-radius: 5px; margin: 0 10px; transition: background-color 0.3s, transform 0.3s;"
  );
  flowyButton.id = "flowyButtonId";
  flowyButton.innerHTML += "Flowy Magic";
  flowyButton.style.cursor = "pointer";
  return flowyButton;
}

function handleFlowyMagic(button, sdk, messageView) {
  button.addEventListener("click", async (e) => {
    e.stopPropagation();
    flowy = button;
    button.style.backgroundColor = "#E1E5EA";
    button.style.transform = "scale(0.95)";
    setTimeout(function () {
      button.style.backgroundColor = "transparent";
      button.style.transform = "scale(1)";
    }, 300);
    sdk.Conversations.registerThreadViewHandler(handleThreadView);
    const sender = messageView.getSender();
    const recipients = await messageView.getRecipientsFull();
    emailContent.cc = recipients.map((item) => item.emailAddress);
    emailContent.bcc = recipients.map((item) => item.emailAddress);
    const to_ = messageView.getRecipients();
    emailContent.recipients = to_;
    const body = messageView.getBodyElement();
    const getAttachment = messageView.getFileAttachmentCardViews();
    emailContent.attachments = getAttachment.map((attachmentView) =>
      attachmentView.getTitle()
    );
    emailContent.sender = sender;
    emailContent.body = body;
    const postData = getPostData();
    chrome.runtime.sendMessage({
      action: "emailToCalendar",
      data: postData,
    });
  });
}

function injectButton(sdk, messageView) {
  const messageViewButton = messageView.getBodyElement();
  const actions = messageViewButton.parentElement.parentElement;

  const firstChild = actions.querySelector("table > tbody > tr > td > table");
  firstChild.setAttribute(
    "style",
    "display: flex;justify-content: space-between;"
  );
  const button = createButton();
  firstChild.appendChild(button);
  handleFlowyMagic(button, sdk, messageView);
}

InboxSDK.load(2, appId, opts).then((sdk) => {
  sdk.Conversations.registerMessageViewHandler(function (messageView) {
    injectButton(sdk, messageView);
  });
});

function handleThreadView(threadView) {
  const subject = threadView.getSubject();
  emailContent.subject = subject;
}

function createErrorModal() {
  const errorModal = document.createElement("div");
  errorModal.id = "flowyErrorModal";
  errorModal.innerHTML = "<p>Something went wrong!</p>";
  errorModal.style.cssText = `
  width: 145px;
  font-size: 13px;
  padding: 5px;
  height: 45px;
  background: rgb(255, 255, 255);
  position: absolute;
  z-index: 99999;
  border-radius: 10px;
  border: 1px solid rgb(176 173 173 / 32%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: block;
  `;
  document.body.appendChild(errorModal);
}

function toggleErrorModal(show) {
  const errorModal = document.getElementById("flowyErrorModal");
  if (errorModal) {
    errorModal.style.display = show ? "block" : "none";
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "errorInResponse") {
    const buttonRect = flowy.getBoundingClientRect();
    if (!document.getElementById("flowyErrorModal")) {
      createErrorModal();
    }

    const errorModal = document.getElementById("flowyErrorModal");
    errorModal.style.top = `${buttonRect.bottom}px`;
    errorModal.style.left = `${buttonRect.left}px`;
    toggleErrorModal(true);
    setTimeout(() => {
      toggleErrorModal(false);
    }, 2000);
  }
  chrome.storage.sync.get(["selectedCalendar"], function (result) {
    const selectedCalendar = result.selectedCalendar || "google";

    if (request && selectedCalendar === "ical") {
      const icalContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `DTSTART:${request?.data?.start?.dateTime}`,
        `DTEND:${request?.data?.end?.dateTime}`,
        `SUMMARY:${request.data?.summary}`,
        `LOCATION:${request.data?.location}`,
        `DESCRIPTION:${request.data?.description}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\n");

      const blob = new Blob([icalContent], {
        type: "text/calendar;charset=utf-8",
      });
      // Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${request.data?.summary}.ics`;

      // Append the link to the document and trigger the click event
      document.body.appendChild(link);
      link.click();

      // Remove the link from the document
      document.body.removeChild(link);
    }
  });
});

document.addEventListener("click", function (event) {
  const errorModal: any = document.getElementById("flowyErrorModal");
  if (errorModal && !errorModal.contains(event.target)) {
    toggleErrorModal(false);
  }
});
