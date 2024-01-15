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
        chrome.tabs.create({
          url: `https://www.google.com/calendar/render?action=TEMPLATE&text=${
            data.calendar_invite.summary
          }&details=${data.calendar_invite.description}&location=${
            data.calendar_invite.location
          }&dates=${data.calendar_invite.start.dateTime}%${
            data.calendar_invite.end.dateTime
          }&add=${data.calendar_invite.attendees.map((el) => el.email)}`,
        });
      })
      .catch((error) => console.error("Error:", error));
  }
});
