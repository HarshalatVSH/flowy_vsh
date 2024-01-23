import "@inboxsdk/core/background.js";

function sendErrorMessage() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {
      action: "errorInResponse",
    });
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "emailToCalendar") {
    // Retrieve the selected calendar from Chrome storage
    chrome.storage.sync.get(["selectedCalendar"], function (result) {
      const selectedCalendar = result.selectedCalendar || "google";

      const apiUrl = "https://app.flowyai.net/apicalendar/emailtocalendar2";
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
          const { description, location, start, end, attendees } =
            data.calendar_invite;
          const isNoneResponse =
            data?.calendar_invite?.summary === "None" &&
            location === "None" &&
            description === "None" &&
            start === "None" &&
            end === "None";
          if (isNoneResponse) {
            sendErrorMessage();
            return;
          } else {
            const encodedSummary = encodeURIComponent(
              data?.calendar_invite?.summary
            );
            const encodedDescription = encodeURIComponent(description);
            const encodedLocation = encodeURIComponent(location);
            const encodedAttendees = attendees
              .map((email) => `&add=${email}`)
              .join("");
            const formatDate = (date) =>
              date.toISOString().replace(/-|:|\.\d+/g, "");
            const encodedDates = encodeURIComponent(
              `${formatDate(new Date(start.dateTime))}/${formatDate(
                new Date(end.dateTime)
              )}`
            );

            let calendarUrl = "";

            switch (selectedCalendar) {
              case "google":
                calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedSummary}&details=${encodedDescription}&location=${encodedLocation}&dates=${encodedDates}${encodedAttendees}`;
                chrome.tabs.create({
                  url: calendarUrl,
                });
                break;
              case "outlook":
                // Fill in the values for Outlook Calendar parameters
                const subject = encodeURIComponent(
                  data?.calendar_invite?.summary
                );
                const encodedAttendeesForOl = attendees
                  .map((email) => `${email}`)
                  .join(",");

                const body = encodeURIComponent(`Description: ${description}`);
                calendarUrl = `https://outlook.office.com/calendar/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${formatDate(
                  new Date(start.dateTime)
                )}&enddt=${formatDate(
                  new Date(end.dateTime)
                )}&subject=${subject}&body=${body}&location=${encodedLocation}&to=${encodedAttendeesForOl}`;

                chrome.tabs.create({
                  url: calendarUrl,
                });

                break;
              case "ical":
                chrome.tabs.sendMessage(sender.tab.id, {
                  data: data.calendar_invite,
                });
                break;
              default:
                break;
            }
          }
        })
        .catch((error) => {
          sendErrorMessage();
        });
    });
  }
});
