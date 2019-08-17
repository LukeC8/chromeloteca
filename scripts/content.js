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

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
    
        let current = JSON.parse(localStorage.getItem('ngStorage-apostasIncluidas'));
        let y = current.length + message.apostas.length;
        let check = setInterval(() => {

            let apostas = JSON.parse(localStorage.getItem('ngStorage-apostasIncluidas'));
            let x = apostas.length;
            let ratio = x / y;
            
            chrome.runtime.sendMessage(message=ratio.toString());

            if (x === y) {
                clearInterval(check);
            }

        }, 100);
        
        document.dispatchEvent(new CustomEvent('chrome_loteca_apostas', {'detail': message}));
    }
);

