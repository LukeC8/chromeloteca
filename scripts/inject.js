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

function bet2(item, id) {

    let carrossel = angular.element(
        document.getElementById(`carrossel_${id}`))

    carrossel.children()[0].children[item-1].click();
}

document.addEventListener('chrome_loteca_apostas', (ev) => {

    switch (ev.detail.type) {
        case 'diadesorte':
        case 'timemania':
            ev.detail.apostas.forEach((v) => {

                let line = v.split(',');
                let item = line[line.length-1];
                let numbers = line.slice(0,-1);

                bet2(item, ev.detail.type);
                apostar(numbers);

            });
            break;
        default:
            ev.detail.apostas.forEach((v) => {
                apostar(v.split(','));
            });
            break;
    }
});
