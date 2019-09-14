/*
 * The content script inserts inject.js inside of the loaded page and remove the element 'script' from the page after load the message listener.
 * The inject.js script needs to be loaded into the page to have access to the angular enviroment.
 *
 */

let s = document.createElement('script');

s.src = chrome.extension.getURL('scripts/inject.js');
s.onload = () => {
    s.parentNode.removeChild(s);
};

document.head.appendChild(s);

/*
 * 1. Receive Data from popup.js
 * 2. Send Data to inject.js
 */
chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        
        // send data to inject.js
        document.dispatchEvent(
            new CustomEvent(
                'chrome_loteca_apostas',
                {'detail': message}
            )
        );
    }
);

/*
 * 1. Receive Progress Bar updates from inject.js
 * 2. Send Progress Bar updates to popup.js
 */
document.addEventListener('chrome_loteca_apostas_progress_bar', (ev) => {
    chrome.runtime.sendMessage(message=ev.detail);
});

