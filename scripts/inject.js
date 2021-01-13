let allowRep = false;

function getNumberId(a) {
    return 'n' + (a < 10 ? '0' + a : a);
}

function apostar(arr) {
    arr.forEach((item, index) => {
        const number = getNumberId(item);
        angular.element(document.getElementById(number)).click();
    });

    angular.element(document.getElementById("colocarnocarrinho")).click();

    return new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
}

function bet2(item, id) {

    let carrossel = angular.element(
        document.getElementById(`carrossel_${id}`)
    );

    carrossel.children()[0].children[item-1].click();
}

/*
 * Send Progress Bar updates and execute callback
 */
async function pushApostas(v, callback) {
    const y = v.length;
    const sendReport = (ratio) => {
        document.dispatchEvent(
            new CustomEvent(
                'chrome_loteca_apostas_progress_bar',
                {'detail': ratio.toString()}
            )
        );
    };

    while (v.length) {
        // send the progress bar information
        let ratio = 1.0 - v.length/y;

        sendReport(ratio);

        await callback(v.shift());
    }

    sendReport(1);
    allowRep = false;
}

/***
 * Handles the confirm box that shows up when duplicated
 * games are released on the site
 */
angular.element(document.body).scope().$root.$on('modal', function(evt, data) {
    switch(data.tipo) {
        case 'confirm-cancel':
            if (allowRep)
                clickModalConfirmCancel(true);
            break;
        default:
            console.log("unknown modal data",  data);
            break;
    }
});

/**
 * Click to increase or decrase the game length
 * @param option: boolean - If true increase the game length otherwise decrease
 */
function increaseDecreaseGameLength(option) {
    const increaseBtn = document.querySelector('#aumentarnumero');
    const decreaseBtn = document.querySelector('#diminuirnumero');
    const click = (btnIncrease, resolve) => {
        if (btnIncrease) {
            increaseBtn.click();
        } else {
            decreaseBtn.click();
        }
        setTimeout(resolve, 50);
    };

    
    return new Promise(resolve => {
        setTimeout(click, 50, option, resolve);
    });
}

/**
 * Adjust Game length
 */
async function adjustGameLength(gameLength) {
    const currentGameLength = () => {
        const gameLengthElement = document.querySelector('.input-mais-menos span');

        return parseInt(gameLengthElement.innerText);
    };

    while (gameLength < currentGameLength()) {
        await increaseDecreaseGameLength(false);
    }

    while (gameLength > currentGameLength()) {
        await increaseDecreaseGameLength(true);
    }
}

/**
 * Click on the modal confirm box
 */
function clickModalConfirmCancel(opt) {
    if (opt){
        const confirmBtn = document.querySelector('#confirm-cancel .modal-footer :first-child');
        setTimeout(() => confirmBtn.click(), 50);
    } else {
        const cancelBtn = document.querySelector('#confirm-cancel .modal-footer :last-child');
        setTimeout(() => cancelBtn.click(), 50);
    }
}

/*
 * Receive data from content.js and process
 */
document.addEventListener('chrome_loteca_apostas', async (ev) => {
    allowRep = ev.detail.allowRep ?? allowRep;

    switch (ev.detail.type) {
        case 'diadesorte':
        case 'timemania':
            pushApostas(ev.detail.apostas, async (v) => {

                let line = v.split(',');
                let item = line[line.length-1];
                let numbers = line.slice(0,-1);

                bet2(item, ev.detail.type);

                await adjustGameLength(numbers.length);
                await apostar(numbers);

            });
            break;
        default:
            pushApostas(ev.detail.apostas, async (v) => {
                const numbers = v.split(',');

                await adjustGameLength(numbers.length);
                await apostar(numbers);
            });
            break;
    }
});
