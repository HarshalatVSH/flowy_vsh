import "@inboxsdk/core/background.js";

console.log("hshshshshshshshsh");

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "callApi") {
    const apiUrl =
      "https://app.flowyai.net/apicalendar/emailtocalendar2?debug=true";
    const apiKey = "calendar_api_key";

    fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(request.data),
    })
      .then((response) => response.json())
      .then((data) => {
        const { summary, description, location, start, end, attendees } =
          data.calendar_invite;
        const isNoneResponse =
          summary === "None" &&
          location === "None" &&
          description === "None" &&
          start === "None" &&
          end === "None";
        if (isNoneResponse) {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              const activeTab = tabs[0];
              chrome.tabs.sendMessage(activeTab.id, {
                action: "errorInResponse",
              });
            }
          );
          return;
        } else {
          chrome.tabs.create({
            url: `https://www.google.com/calendar/render?action=TEMPLATE&text=${summary}&details=${description}&location=${location}&dates=${
              start.dateTime
            }%${end.dateTime}&add=${attendees.map((el) => el.email)}`,
          });
        }
      })
      .catch((error) => {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
              action: "errorInResponse",
            });
          }
        );

        console.error("Error:", error)
      });
  }
});
