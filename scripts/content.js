/*
 * The inject.js script needs to be loaded into the page to to have access to the angular enviroment. The content script so inserts inject.js script inside loaded page and remove  the script from the page after load the message listener.
 *
 *
 */
let s = document.createElement('script');

s.src = chrome.extension.getURL('scripts/inject.js');
s.onload = () => {
    s.parentNode.removeChild(s);
};

document.head.appendChild(s);

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        document.dispatchEvent(new CustomEvent('chrome_loteca_apostas', {'detail': message}));
    
    }
);

