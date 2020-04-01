/*
 * Created by: lucas[dot]correa[at]gmx[dot]com - 19/07/2019
 */

class Bet {
    //The Bet is OK
    static STATUS_OK = 0;

    //The Bet has different quantity of numbers for the GameType
    static STATUS_LEN_ERROR = 1;

    //Some number in Bet has wrong value
    static STATUS_ITENS_ERROR = 2;

    constructor(arr, gameProp) {
        this.numbers = [...new Set(arr)].map( (i) => { return i%100; } );
        this.gameProp = gameProp;

        this.numbers.sort((a,b) => {
            return a - b;
        });
    }

    check(arr = this.numbers, gameProp = this.gameProp) {

        let checkItens = this.checkItens(arr, gameProp);
        let checkLen  = this.checkLen(arr, gameProp);

        //0b00 -> ok;
        //0b01 -> itens ok & len error;
        //0b10 -> itens error & len ok;
        //0b11 -> itens error & len error;
        return checkItens << 1 | checkLen;
    }

    checkLen(arr = this.numbers, gameProp = this.gameProp) {
        return !gameProp.subTypes.some((item, idx) => {
            return item == arr.length;
        });
    }

    checkItens(arr = this.numbers, gameProp = this.gameProp) {
        return arr.some((item, idx) => {

            //
            //lotomania item can be 0
            //
            let minimal = 0 - (gameProp.caption && gameProp.caption.endsWith('lotomania'));

            return (item <= minimal || gameProp.span < item);
        });
    }

    toString() {
        return this.numbers.toString();
    }
};

class Bet2 extends Bet {

    constructor(arr, gameProp) {
        super(arr.slice(0,-1), gameProp);
        this.bet2 = arr[arr.length-1];
    }

    checkItens(arr = this.numbers, gameProp = this.gameProp) {
        let oknumbers = super.checkItens(arr, gameProp);
        let okspan2 = this.bet2 >= 1 && this.bet2 <= gameProp.span2;

        return oknumbers || !okspan2;
    }

    toString() {
       return `${super.toString()},${this.bet2}`;
    }
};


class GameType {

    static lotomania = {
        caption: "lotomania",
        subTypes: [50],
        span: 100
    };

    static lotofacil = {
        caption: "lotofacil/especial",
        subTypes: [15,16,17,18],
        span: 25
    };

    static megasena = {
        caption: "mega-sena",
        subTypes: [6,7,8,9,10,11,12,13,14,15],
        span: 60
    };

    static quina = {
        subTypes: [5,6,7,8,9,10,11,12,13,14,15],
        span: 80
    };

    static timemania = {
        subTypes: [10],
        span: 80,
        span2: 80
    };

    static diadesorte = {
        caption: "dia-de-sorte",
        subTypes: [7,8,9,10,11,12,13,14,15],
        span: 31,
        span2: 12
    };

    static duplasena = {
        caption: "dupla-sena",
        subTypes: [6,7,8,9,10,11,12,13,14,15],
        span: 50
    };

    /*
     * TODO:
    static loteca = {
    };
    */
};

class BetFactory {
    static create(arr, type) {
        switch(type) {
            case 'diadesorte':
            case 'timemania':
                return new Bet2(arr, GameType[type]);
            default:
                return new Bet(arr, GameType[type]);
        }
    }
};

const sepSupported = ",;\-";
let btnProcess = document.getElementById("btnProcess");
let btnApostar = document.getElementById("apostar");
let btnLimpaTbJogos = document.getElementById("limpartbjogos");
let texAreaElt = document.getElementById("jogostext");
let betSet = new Set(); //to check repeated bets

//
// INIT 
//
populate(GameType);

/*
 * Populate some elements on popup.html
 */
function populate(classSupported) {
    
    //====================================
    // step 0 - check if is in a bet page
    //====================================

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {

        let inBetPage = Object.keys(classSupported).some((v, idx) => {

            let caption = classSupported[v].caption ? classSupported[v].caption : ' ';
            let url = tabs[0].url;

            if (url.endsWith(v) || url.endsWith(caption)) {
                let selectElt = document.getElementById("jogoslist");
                let opt = document.createElement('option');

                opt.value = v; opt.name = v;
                opt.innerHTML = v;
                selectElt.add(opt);

                return true;
            }

            return false;
        });
        
        //
        // disable all buttons if it is not a bet page
        //
        if (!inBetPage) {

            let btns = document.getElementsByTagName("button");

            for(let i = 0; i < btns.length; ++i)
                btns[i].disabled = true;
        }
    });

    //=========================
    // step 1 -
    //=========================
}

/*
 * Transform Text Area data into array of array
 */
function textAreaProcess(text, sep=',') {
    let arr = [];

    text.trim().split('\n').forEach((v) => {
        let jogo = [];
        
        v.trim().split(sep).forEach((j) => {
            let num = parseInt(j.trim());
            
            if (!isNaN(num))
                jogo.push(num);
        });

        if (jogo.length) {
            arr.push(jogo);
        }
    });

    return arr;
}

/* createRow - Add new row to the table
 *
 * rowInfo
 *  col1: counter
 *  col2: bet
 *  col3: bet status
 */
function createRow(rowInfo) {
    
    function createImgElement(src) {
        let img = document.createElement("img");
        img.src = src;
        return img;
    }

    function addCol(info, row) {
        let newCell = document.createElement("td");

        newCell.style = "text-align:center";
        newCell.appendChild(info);
        row.appendChild(newCell);
    }

    let newRowElement = document.createElement("tr");

    //col 1 is the counter
    let col1 = document.createElement("p");
    col1.innerHTML = rowInfo.col1;

    //col 2 is the bet
    let col2 = document.createElement("p");
    col2.innerHTML = rowInfo.col2;

    //col 3 is the bet status (valid or not);
    let src = rowInfo.col3 ? 'checked' : 'delete';
    let col3 = createImgElement(`../img/${src}.png`);

    [col1, col2, col3].forEach((col) => {
        addCol(col, newRowElement);
    });

    return newRowElement;
}

/*
 * Choose the separator character automatically from the text
 */
texAreaElt.oninput = (element) => {
    const separator = document.getElementById('tbSeparator');
    const txt = element.target.value.trim();
    const choose = txt.search(RegExp(`[${sepSupported}]`));
    const chooseChar = choose > -1 ? txt[choose] : ' ';

    separator.value = chooseChar;
    separator.hidden = false;
}

btnProcess.onclick = (element) => {
    
    let tableElt = document.getElementById("tbjogosbdy");
    let selectElt = document.getElementById("jogoslist");
    let divElt = document.getElementById("jogos");
    let textAreaElt = document.getElementById('jogostext');
    let warnInfoElt = document.getElementById('warntext');
    let separator = document.getElementById('tbSeparator');

    let sep = separator.options[separator.selectedIndex].value;
    let arr = textAreaProcess(textAreaElt.value, sep);

    arr.forEach((v, idx) => {
        
        if (v.length === 0) {
            console.log('nulll');
            return;
        }

        let rptText = '';
        let betType = selectElt.selectedOptions[0].value;
        let bet = BetFactory.create(v, betType);
        let betStr = bet.toString();
        let betStatus = bet.check() | (betSet.has(betStr) << 2);

        let rowInfo = {
            col1: tableElt.childNodes.length+1,
            col2: betStr,
            col3: betStatus === Bet.STATUS_OK
        };
        
        if (betStatus === Bet.STATUS_OK) {
            betSet.add(betStr);
        } else {
            rptText = `Jogo ${rowInfo.col1} Inválido - ${betStr} - `;

            if (betStatus & (Bet.STATUS_ITENS_ERROR | Bet.STATUS_LEN_ERROR)) {
                rptText += `error Code: ${betStatus.toString(2)}`;
            } else {
                rptText += 'Aposta repetida!!';
            }

            rptText += '\n';
        }

        tableElt.appendChild(createRow(rowInfo));
        divElt.scrollTop = divElt.scrollHeight; //update scroll position
        warnInfoElt.value += rptText;
    });

    //after insert, reset textArea
    textAreaElt.value = '';
    separator.hidden = true;
};

btnApostar.onclick = (element) => {
    let progress = document.getElementById("myProgress");
    let textArea = document.getElementById('jogostext');
    let selectElt = document.getElementById('jogoslist');

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        
        let betType = selectElt.selectedOptions[0].value;
        let message = {
            type: betType,
            apostas: new Array(...betSet)
        };

        chrome.tabs.sendMessage(tabs[0].id, message);

        betSet.clear();
        btnApostar.disabled = true;
        progress.style.visibility = "visible";
    });
};

btnLimpaTbJogos.onclick = (element) => {
    let tableBdyElt = document.getElementById("tbjogosbdy");
    let warnInfoElt = document.getElementById("warntext");

    let child = tableBdyElt.firstChild;
    
    while (child) {
        tableBdyElt.removeChild(child);
        child = tableBdyElt.firstChild;
    }

    betSet.clear();
    warnInfoElt.value = '';
}

/*
 * 1. Receive progress bar updates from content.js
 * 2. Update progress bar
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let progress = document.getElementById("myProgress");
    let bar = document.getElementById("myBar");
    let ratio = parseFloat(message) * 100.0;

    bar.style.width = ratio + '%';
    bar.innerHTML = parseInt(ratio) + '%';

    if (ratio == 100) {
        setTimeout(() => {
            btnApostar.disabled = false;
            progress.style.visibility = "hidden";
        }, 1500);
    }
});

