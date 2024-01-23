import { data } from "autoprefixer";

let flowy;
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

function injectButton(MessageActions) {
  const flowyButton = createButton();
  const childNode = MessageActions?.children[0];
  childNode.insertBefore(flowyButton, childNode.firstChild);
  (MessageActions as HTMLElement).dataset.reportButtonAdded = "true";
  clickOnFlowyButton(flowyButton);
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
    "cursor: pointer;display: flex;align-items: center;gap: 3px;padding: 5px; background: none; border: none; border-radius: 5px; margin: 0 10px; transition: background-color 0.3s, transform 0.3s;"
  );
  flowyButton.id = "flowyButtonId";
  flowyButton.innerHTML += "Flowy Magic";
  flowyButton.style.cursor = "pointer";
  return flowyButton;
}

function clickOnFlowyButton(flowyButton) {
  flowyButton.addEventListener("click", (e) => {
    e.stopPropagation();
    flowy = flowyButton;
    flowyButton.style.backgroundColor = "#E1E5EA";
    flowyButton.style.transform = "scale(0.95)";
    setTimeout(function () {
      flowyButton.style.backgroundColor = "transparent";
      flowyButton.style.transform = "scale(1)";
    }, 300);
    const emailMessage = flowyButton.closest("div[aria-label='Email message']");
    const emailInfo = scrapeEmailInfo(emailMessage);

    chrome.runtime.sendMessage({
      action: "emailToCalendar",
      data: [emailInfo],
    });
  });
}

function getEmailBody(emailMessage) {
  let emailContent = "";
  const emailContentElement = emailMessage.querySelectorAll(
    "div[aria-label='Message body']"
  );
  emailContentElement?.forEach((element: HTMLElement) => {
    emailContent += element?.innerText;
  });
  return emailContent;
}

function getCC(emailMessage) {
  const recieverAccessor = emailMessage.querySelector(
    "div[data-testid='RecipientWell']"
  );
  let getCC = recieverAccessor?.getElementsByTagName("div")[2]?.textContent;
  getCC = getCC?.replace(/<|>/g, "");
  const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const resultString = getCC?.match(regex);
  return resultString;
}

function getAttachments(emailMessage) {
  var ariaLabelArray = [];
  const attchmentAccessor = emailMessage.querySelector(
    "div[aria-label='image attachments']"
  );
  if (attchmentAccessor) {
    var childElements = attchmentAccessor?.querySelectorAll('[role="option"]');
    childElements.forEach(function (childElement) {
      var ariaLabel = childElement?.getAttribute("aria-label");
      ariaLabelArray?.push(ariaLabel);
    });
  }
  return ariaLabelArray;
}

function getTo(emailMessage) {
  let emailId: string;
  const userMailID = document
    .querySelector("a[aria-label='Go to Outlook']")
    ?.getAttribute("href");
  if (userMailID?.includes("login_hint")) {
    var loginHintParam = userMailID?.split("login_hint=")[1];
    emailId = decodeURIComponent(loginHintParam?.split("&")[0]);
    localStorage.setItem("userID", emailId);
  }
  return emailId;
}

function getSubject(emailMessage) {
  const ConversationReadingPaneContainer = emailMessage?.closest(
    "#ConversationReadingPaneContainer"
  );
  // const subjectAccessor = emailMessage?.querySelector(
  //   "#ConversationReadingPaneContainer"
  // );
  const subject =
    ConversationReadingPaneContainer?.getElementsByTagName("div")[0]
      ?.textContent;
  return subject;
}

function getSender(emailMessage) {
  const sender = emailMessage.querySelector(".OZZZK")?.textContent;
  var email = sender.match(/<([^>]+)>/);
  if (email && email.length > 1) {
    return email[1];
  }
}

function scrapeEmailInfo(emailMessage) {
  const body = getEmailBody(emailMessage);
  const getcc = getCC(emailMessage);
  const attachments = getAttachments(emailMessage);
  const to = getTo(emailMessage);
  const subject = getSubject(emailMessage);
  const from_ = getSender(emailMessage);

  const cc = getcc ? getcc : "";
  const emailInfo = {
    subject: subject,
    body: body,
    to: [to],
    cc: [cc],
    bcc: [cc],
    from_: from_ ? from_ : "",
    sent_at: new Date().toLocaleString(),
    attachments: attachments,
  };
  return emailInfo;
}

async function findCSSElements(selector): Promise<NodeList> {
  return new Promise<NodeList>((resolve) => {
    const intervalId = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(intervalId);
        resolve(element);
      }
    }, 500);
  });
}

function findConversations() {
  const MessageActions = document.querySelectorAll(
    "div[aria-label='Message actions']"
  );
  for (const elements of MessageActions) {
    if ((elements as HTMLElement).dataset.reportButtonAdded === "true") {
      continue;
    }
    injectButton(elements);
  }
}

const observerForConversations = new MutationObserver(function (
  mutationsList,
  observer
) {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      findConversations();
    }
  }
});
const observerConfig = { childList: true, subtree: true };
observerForConversations.observe(document.body, observerConfig);
