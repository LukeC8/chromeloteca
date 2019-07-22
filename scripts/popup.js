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
        this.numbers = [...new Set(arr)];
        this.gameProp = gameProp;
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
            return (item <= 0 || gameProp.span < item);
        });
    }

    isGoldenBet(arr = this.numbers, gameProp = this.gameProp) {
        return this.checkLen(arr, gameProp) && arr.length > gameProp.subTypes[0];
    }
};

class GameType {

    static lotomania = {
        subTypes: [50],
        span: 100
    };

    static lotofacil = {
        subTypes: [15,16,17,18],
        span: 25
    };

    static megasena = {
        subTypes: [6,7,8,9,10,11,12,13,14,15],
        span: 60
    };

    static quina = {
        subTypes: [5,6,7,8,9,10,11,12,13,14,15],
        span: 80
    };

    static timemania = {
        subTypes: [10],
        span: 80
    };
};

let btnProcess = document.getElementById("btnProcess");
let btnApostar = document.getElementById("changeColor");
let btnLimpaTbJogos = document.getElementById("limpartbjogos");
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

            console.log('urlEndsWith', v, '?', tabs[0].url.endsWith(v));

            if (tabs[0].url.endsWith(v)) {
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

btnApostar.onclick = (element) => {
    let textArea = document.getElementById('jogostext');

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        
        chrome.tabs.sendMessage(tabs[0].id, new Array(...betSet));

        betSet.clear();
    });
};

/*
 * Transform Text Area data into array of array
 */
function textAreaProcess(text, sep=',') {
    let arr = [];

    text.trim().split('\n').forEach((v) => {
        let jogo = [];
        
        v.trim().split(',').forEach((j) => {
            let num = parseInt(j.trim());
            
            if (!isNaN(num))
                jogo.push(num);
        });

        if (jogo.length) {
            jogo.sort();
            arr.push(jogo);
        }
    });

    return arr;
}


btnProcess.onclick = (element) => {
    
    let tableElt = document.getElementById("tbjogosbdy");
    let selectElt = document.getElementById("jogoslist");
    let divElt = document.getElementById("jogos");
    let textAreaElt = document.getElementById('jogostext');
    let warnInfoElt = document.getElementById('warntext');
    
    let arr = textAreaProcess(textAreaElt.value);

    arr.forEach((v, idx) => {
        
        if (v.length === 0) {
            console.log('nulll');
            return;
        }
        
        let rptText = '';
        let betType = GameType[selectElt.selectedOptions[0].value];
        let bet = new Bet(v, betType);
        let betStr = v.toString();
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
};


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

