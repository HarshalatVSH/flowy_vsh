import React, { useEffect, useState } from "react";

const Popup = () => {
  const [selectedCalendar, setSelectedCalendar] = useState("google");

  useEffect(() => {
    chrome.storage.sync.get(["selectedCalendar"], (result) => {
      if (result.selectedCalendar) {
        setSelectedCalendar(result.selectedCalendar);
      }
    });
  }, []);

  const handleRadioChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedCalendar(selectedValue);
    chrome.storage.sync.set({ selectedCalendar: selectedValue });
  };

  return (
    <div style={{ width: "400px", height: "200px" }}>
      <nav className="h-20 bg-indigo-100 text-gray-800 text-2xl">
        <ul className="flex items-center justify-center h-full px-10">
          <li>Flowy Settings</li>
        </ul>
      </nav>
      <div className="flex items-center justify-center">
        <div className="">
          <h2 className="text-xl lg:text-2xl font-semibold">
            Select Calendar:
          </h2>
          <div className="flex gap-3">
            <input
              type="radio"
              id="google"
              value="google"
              checked={selectedCalendar === "google"}
              onChange={handleRadioChange}
            />
            <label
              className="flex bg-gray-100 text-gray-700 rounded-md px-3 py-2 my-3  hover:bg-indigo-300 cursor-pointer"
              htmlFor="google"
            >
              Google Calendar
            </label>
          </div>
          <div className="flex gap-3">
            <input
              type="radio"
              id="outlook"
              value="outlook"
              checked={selectedCalendar === "outlook"}
              onChange={handleRadioChange}
            />
            <label
              className="flex bg-gray-100 text-gray-700 rounded-md px-3 py-2 my-3  hover:bg-indigo-300 cursor-pointer"
              htmlFor="outlook"
            >
              Outlook Calendar
            </label>
          </div>
          <div className="flex gap-3">
            <input
              type="radio"
              id="ical"
              value="ical"
              checked={selectedCalendar === "ical"}
              onChange={handleRadioChange}
            />
            <label
              className="flex bg-gray-100 text-gray-700 rounded-md px-3 py-2 my-3  hover:bg-indigo-300 cursor-pointer"
              htmlFor="ical"
            >
              iCal Calendar
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
