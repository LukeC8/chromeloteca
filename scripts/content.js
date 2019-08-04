//number id
console.log('extension injected script');

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

