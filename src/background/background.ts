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
          "Access-Control-Allow-Origin": "https://mail.google.com/mail/",
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(request.data),
      })
        .then((response) => response.json())
        .then((data) => console.log(data, 'data recieved form api'))
        .catch((error) => console.error("Error:", error));
    }
  });