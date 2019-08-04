function getNumberId(a) {
    return 'n' + (a < 10 ? '0' + a : a);
}

function apostar(arr) {

    arr.forEach((item, index) => {
        const number = getNumberId(item);
        angular.element(document.getElementById(number)).click();
    });

    angular.element(document.getElementById("colocarnocarrinho")).click();
}

document.addEventListener('chrome_loteca_apostas', (ev) => {
    ev.detail.forEach((v) => {
        apostar(v.split(','));
    });
});
