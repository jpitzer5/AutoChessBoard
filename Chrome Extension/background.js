chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "OFF",
    });
});

const bot = 'https://www.chess.com/play/computer';
const live = 'https://www.chess.com/game/live';

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(bot) || tab.url.startsWith(live)) {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === 'ON' ? 'OFF' : 'ON'

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });

    if (nextState === "ON") {
        // Run script to set up MutationObserver and websocket
        await chrome.scripting.executeScript({
          files: ["logMove.js"],
          target: { tabId: tab.id },
        });

    } else if (nextState === "OFF") {
        // Run script to stop the MutationObserver and close the websocket
        await chrome.scripting.executeScript({
          files: ["stopLoggingMoves.js"],
          target: { tabId: tab.id },
        });
    }
  }
});