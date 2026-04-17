let contador = 0, EsmeraldasXSegundo = 0, timer = 0;

let mejoraTronco = 0, mejoraPiedra = 0, mejoraCarbon = 0, mejoraHierro = 0, mejoraLapiz = 0, mejoraRedstone = 0, mejoraOro = 0, mejoraDiamante = 0, mejoraObsidiana = 0;

let ValorTronco_C = 10,  ValorTronco_V = 5;
let ValorPiedra_C = 100, ValorPiedra_V = 50;
let ValorCarbon_C = 1000, ValorCarbon_V = 500;
let ValorHierro_C = 100000, ValorHierro_V = 50000;
let ValorLapiz_C = 1000000, ValorLapiz_V = 500000;
let ValorRedstone_C = 10000000, ValorRedstone_V = 5000000;
let ValorOro_C = 100000000, ValorOro_V = 50000000;
let ValorDiamante_C = 1000000000, ValorDiamante_V = 500000000;
let ValorObsidiana_C = 10000000000, ValorObsidiana_V = 5000000000;

let mejoraPiedraDesbloqueada = false, mejoraCarbonDesbloqueada = false, mejoraHierroDesbloqueada = false, mejoraLapizDesbloqueada = false, mejoraRedstoneDesbloqueada = false, mejoraOroDesbloqueada = false, mejoraDiamanteDesbloqueada = false, mejoraObsidianaDesbloqueada = false;

function guardarProgresso() {
    var gameProgress = {
        contador: contador,
        EsmeraldasXSegundo: EsmeraldasXSegundo,
        timer: timer,

        mejoraTronco: mejoraTronco,
        mejoraPiedra: mejoraPiedra,
        mejoraCarbon: mejoraCarbon,
        mejoraHierro: mejoraHierro,
        mejoraLapiz: mejoraLapiz,
        mejoraRedstone: mejoraRedstone,
        mejoraOro: mejoraOro,
        mejoraDiamante: mejoraDiamante,
        mejoraObsidiana: mejoraObsidiana,

        ValorTronco_C: ValorTronco_C,
        ValorTronco_V: ValorTronco_V,
        ValorPiedra_C: ValorPiedra_C,
        ValorPiedra_V: ValorPiedra_V,
        ValorCarbon_C: ValorCarbon_C,
        ValorCarbon_V: ValorCarbon_V,
        ValorHierro_C: ValorHierro_C,
        ValorHierro_V: ValorHierro_V,
        ValorLapiz_C: ValorLapiz_C,
        ValorLapiz_V: ValorLapiz_V,
        ValorRedstone_C: ValorRedstone_C,
        ValorRedstone_V: ValorRedstone_V,
        ValorOro_C: ValorOro_C,
        ValorOro_V: ValorOro_V,
        ValorDiamante_C: ValorDiamante_C,
        ValorDiamante_V: ValorDiamante_V,
        ValorObsidiana_C: ValorObsidiana_C,
        ValorObsidiana_V: ValorObsidiana_V,

        mejoraPiedraDesbloqueada: mejoraPiedraDesbloqueada,
        mejoraCarbonDesbloqueada: mejoraCarbonDesbloqueada,
        mejoraHierroDesbloqueada: mejoraHierroDesbloqueada,
        mejoraLapizDesbloqueada: mejoraLapizDesbloqueada,
        mejoraRedstoneDesbloqueada: mejoraRedstoneDesbloqueada,
        mejoraOroDesbloqueada: mejoraOroDesbloqueada,
        mejoraDiamanteDesbloqueada: mejoraDiamanteDesbloqueada,
        mejoraObsidianaDesbloqueada: mejoraObsidianaDesbloqueada,
    };
    var gameProgressText = JSON.stringify(gameProgress);

    var blob = new Blob([gameProgressText], { type: "text/plain;charset=utf-8" });

    var url = URL.createObjectURL(blob);

    var downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "gameProgress.txt";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

document.querySelector('.guardar').addEventListener('click', guardarProgresso);

function cargarProgresso() {
    var input = document.querySelector('.cargar');
    var file = input.files[0];

    if (!file) {
        ad("No se seleccionó ningún archivo");
        return;
    }

    var reader = new FileReader();

    reader.onload = function (e) {
        var contenido = e.target.result;
        var gameProgress = JSON.parse(contenido);

        contador = gameProgress.contador,
        timer = gameProgress.timer,
        mejoraTronco = gameProgress.mejoraTronco,
        mejoraPiedra = gameProgress.mejoraPiedra,
        mejoraCarbon = gameProgress.mejoraCarbon,
        mejoraHierro = gameProgress.mejoraHierro,
        mejoraLapiz = gameProgress.mejoraLapiz,
        mejoraRedstone = gameProgress.mejoraRedstone,
        mejoraOro = gameProgress.mejoraOro,
        mejoraDiamante = gameProgress.mejoraDiamante,
        mejoraObsidiana = gameProgress.mejoraObsidiana,
        ValorTronco_C = gameProgress.ValorTronco_C,
        ValorTronco_V = gameProgress.ValorTronco_V,
        ValorPiedra_C = gameProgress.ValorPiedra_C,
        ValorPiedra_V = gameProgress.ValorPiedra_V,
        ValorCarbon_C = gameProgress.ValorCarbon_C,
        ValorCarbon_V = gameProgress.ValorCarbon_V,
        ValorHierro_C = gameProgress.ValorHierro_C,
        ValorHierro_V = gameProgress.ValorHierro_V,
        ValorLapiz_C = gameProgress.ValorLapiz_C,
        ValorLapiz_V = gameProgress.ValorLapiz_V,
        ValorRedstone_C = gameProgress.ValorRedstone_C,
        ValorRedstone_V = gameProgress.ValorRedstone_V,
        ValorOro_C = gameProgress.ValorOro_C,
        ValorOro_V = gameProgress.ValorOro_V,
        ValorDiamante_C = gameProgress.ValorDiamante_C,
        ValorDiamante_V = gameProgress.ValorDiamante_V,
        ValorObsidiana_C = gameProgress.ValorObsidiana_C,
        ValorObsidiana_V = gameProgress.ValorObsidiana_V,
        mejoraPiedraDesbloqueada = gameProgress.mejoraPiedraDesbloqueada,
        mejoraCarbonDesbloqueada = gameProgress.mejoraCarbonDesbloqueada,
        mejoraHierroDesbloqueada = gameProgress.mejoraHierroDesbloqueada,
        mejoraLapizDesbloqueada = gameProgress.mejoraLapizDesbloqueada,
        mejoraRedstoneDesbloqueada = gameProgress.mejoraRedstoneDesbloqueada,
        mejoraOroDesbloqueada = gameProgress.mejoraOroDesbloqueada,
        mejoraDiamanteDesbloqueada = gameProgress.mejoraDiamanteDesbloqueada,
        mejoraObsidianaDesbloqueada = gameProgress.mejoraObsidianaDesbloqueada;

            if(mejoraPiedraDesbloqueada){
            document.querySelector('.mej-piedra').style.display = "block";
            document.querySelector('.mej-black-piedra').style.display = "none";
            }
            if(mejoraCarbonDesbloqueada){
            document.querySelector('.mej-carbon').style.display = "block";
            document.querySelector('.mej-black-carbon').style.display = "none";
            }
            if(mejoraHierroDesbloqueada){
            document.querySelector('.mej-hierro').style.display = "block";
            document.querySelector('.mej-black-hierro').style.display = "none";
            }
            if(mejoraLapizDesbloqueada){
            document.querySelector('.mej-lapiz').style.display = "block";
            document.querySelector('.mej-black-lapiz').style.display = "none";
            }
            if(mejoraRedstoneDesbloqueada){
            document.querySelector('.mej-redstone').style.display = "block";
            document.querySelector('.mej-black-redstone').style.display = "none";
            }
            if(mejoraOroDesbloqueada){
            document.querySelector('.mej-oro').style.display = "block";
            document.querySelector('.mej-black-oro').style.display = "none";
            }
            if(mejoraDiamanteDesbloqueada){
            document.querySelector('.mej-diamante').style.display = "block";
            document.querySelector('.mej-black-diamante').style.display = "none";
            }
            if(mejoraObsidianaDesbloqueada){
            document.querySelector('.mej-obsidiana').style.display = "block";
            document.querySelector('.mej-black-obsidiana').style.display = "none";
            }
            if(mejoraTronco){
                document.getElementById('text-tronco').innerHTML = (mejoraTronco) + " Mejora de Tronco";
            }
            if(mejoraPiedra){
                document.getElementById('text-piedra').innerHTML = (mejoraPiedra) + " Mejora de Piedra";
            }
            if(mejoraCarbon){
                document.getElementById('text-carbon').innerHTML = (mejoraCarbon) + " Mejora de Carbon";
            }
            if(mejoraHierro){
                document.getElementById('text-hierro').innerHTML = (mejoraHierro) + " Mejora de Hierro";
            }
            if(mejoraLapiz){
                document.getElementById('text-lapiz').innerHTML = (mejoraLapiz) + " Mejora de Lapiz";
            }
            if(mejoraRedstone){
                document.getElementById('text-redstone').innerHTML = (mejoraRedstone) + " Mejora de Redstone";
            }
            if(mejoraOro){
                document.getElementById('text-oro').innerHTML = (mejoraOro) + " Mejora de Oro";
            }
            if(mejoraDiamante){
                document.getElementById('text-diamante').innerHTML = (mejoraDiamante) + " Mejora de Diamante";
            }
            if(mejoraObsidiana){
                document.getElementById('text-obsidiana').innerHTML = (mejoraObsidiana) + " Mejora de Obsidiana";
            }
    };

    reader.readAsText(file);
}

document.querySelector('.cargar').addEventListener('change', cargarProgresso);

function click() {
    contador++
    contador += mejoraTronco;
    contador += (mejoraPiedra  / 0.2);
    contador += (mejoraCarbon / 0.25);
    contador += (mejoraHierro / 0.3);
    contador += (mejoraLapiz / 0.4);
    contador += (mejoraRedstone / 0.45);
    contador += (mejoraOro / 0.5);
    contador += (mejoraDiamante / 0.6);
    contador += (mejoraObsidiana / 0.65);
    document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";
}

document.getElementById('click').addEventListener('click', click);

setInterval(function () {
    timer++;
    contador += EsmeraldasXSegundo;
    document.getElementById('timer').innerHTML = "Tiempo transcurrido: " + (timer);
    document.getElementById('xseg').innerHTML = (EsmeraldasXSegundo) + " Clicks Pasivos";
    document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";
    
}, 1000);

function comprarMejoraTronco() {
    if (contador >= ValorTronco_C) {
        contador -= ValorTronco_C;
        mejoraTronco++;
        ValorTronco_C = (ValorTronco_C + 10);
        ValorTronco_V = (ValorTronco_C / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-tronco').innerHTML = "Comprar por " + ValorTronco_C.toFixed(2) + " $";
        document.getElementById('Vender-tronco').innerHTML = "Vender por " + ValorTronco_V.toFixed(2) + " $";
        document.getElementById('text-tronco').innerHTML = (mejoraTronco) + " Mejora de tronco";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

        if (mejoraTronco >= 10) {
            mejoraPiedraDesbloqueada = true;
            document.querySelector('.mej-piedra').style.display = "block";
            document.querySelector('.mej-black-piedra').style.display = "none";
        }
    }
}

document.querySelector('.Comprar-tronco').addEventListener('click', comprarMejoraTronco);

function venderMejoraTronco() {
    if (mejoraTronco >= 1) {
        contador += ValorTronco_V;
        mejoraTronco--;
        ValorTronco_C = (ValorTronco_C - 10);
        ValorTronco_V = (ValorTronco_V / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-tronco').innerHTML = "Comprar por " + ValorTronco_C.toFixed(2) + " $";
        document.getElementById('Vender-tronco').innerHTML = "Vender por " + ValorTronco_V.toFixed(2) + " $";
        document.getElementById('text-tronco').innerHTML = (mejoraTronco) + " Mejora de tronco";    
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

    }
}

document.querySelector('.Vender-tronco').addEventListener('click', venderMejoraTronco);

function comprarMejoraPiedra() {
    if (contador >= ValorPiedra_C) {
        contador -= ValorPiedra_C;
        mejoraPiedra++;
        ValorPiedra_C = (ValorPiedra_C + 100);
        ValorPiedra_V = (ValorPiedra_C / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-piedra').innerHTML = "Comprar por " + ValorPiedra_C.toFixed(2) + " $";
        document.getElementById('Vender-piedra').innerHTML = "Vender por " + ValorPiedra_V.toFixed(2) + " $";
        document.getElementById('text-piedra').innerHTML = (mejoraPiedra) + " Mejora de Piedra";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

        if (mejoraPiedra >= 10) {
            mejoraCarbonDesbloqueada = true;
            document.querySelector('.mej-carbon').style.display = "block";
            document.querySelector('.mej-black-carbon').style.display = "none";
        }
    }
}

document.querySelector('.Comprar-piedra').addEventListener('click', comprarMejoraPiedra);

function venderMejoraPiedra() {
    if (mejoraPiedra >= 1) {
        contador += ValorPiedra_V;
        mejoraPiedra--;
        ValorPiedra_C = (ValorPiedra_C - 100);
        ValorPiedra_V = (ValorPiedra_V / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-piedra').innerHTML = "Comprar por " + ValorPiedra_C.toFixed(2) + " $";
        document.getElementById('Vender-piedra').innerHTML = "Vender por " + ValorPiedra_V.toFixed(2) + " $";
        document.getElementById('text-piedra').innerHTML = (mejoraPiedra) + " Mejora de Piedra";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

    }
}

document.querySelector('.Vender-piedra').addEventListener('click', venderMejoraPiedra);

function comprarMejoraCarbon() {
    if (contador >= ValorCarbon_C) {
        contador -= ValorCarbon_C;
        mejoraCarbon++;
        EsmeraldasXSegundo += 5;
        ValorCarbon_C = (ValorCarbon_C + 1000);
        ValorCarbon_V = (ValorCarbon_C / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-carbon').innerHTML = "Comprar por " + (ValorCarbon_C / 1000).toFixed(2) + "k $";
        document.getElementById('Vender-carbon').innerHTML = "Vender por " + (ValorCarbon_V / 1000).toFixed(2) + "k $";
        document.getElementById('text-carbon').innerHTML = (mejoraCarbon) + " Mejora de Carbon";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

        if (mejoraCarbon >= 10) {
            mejoraHierroDesbloqueada = true;
            document.querySelector('.mej-hierro').style.display = "block";
            document.querySelector('.mej-black-hierro').style.display = "none";
        }
    }
}

document.querySelector('.Comprar-carbon').addEventListener('click', comprarMejoraCarbon);

function venderMejoraCarbon() {
    if (mejoraCarbon >= 1) {
        contador += ValorCarbon_V;
        mejoraCarbon--;
        EsmeraldasXSegundo -= 5;
        ValorCarbon_C = (ValorCarbon_C - 1000);
        ValorCarbon_V = (ValorCarbon_V / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-carbon').innerHTML = "Comprar por " + (ValorCarbon_C / 1000).toFixed(2) + "k $";
        document.getElementById('Vender-carbon').innerHTML = "Vender por " + (ValorCarbon_V / 1000).toFixed(2) + "k $";
        document.getElementById('text-carbon').innerHTML = (mejoraCarbon) + " Mejora de Carbon";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

    }
}

document.querySelector('.Vender-carbon').addEventListener('click', venderMejoraCarbon);

function comprarMejoraHierro() {
    if (contador >= ValorHierro_C) {
        contador -= ValorHierro_C;
        mejoraHierro++;
        EsmeraldasXSegundo += 50;
        ValorHierro_C = (ValorHierro_C + 100000);
        ValorHierro_V = (ValorHierro_C / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-hierro').innerHTML = "Comprar por " + (ValorHierro_C / 1000).toFixed(2) + "k $";
        document.getElementById('Vender-hierro').innerHTML = "Vender por " + (ValorHierro_V / 1000).toFixed(2) + "k $";
        document.getElementById('text-hierro').innerHTML = (mejoraHierro) + " Mejora de Hierro";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

        if (mejoraHierro >= 10) {
            mejoraLapizDesbloqueada = true;
            document.querySelector('.mej-lapiz').style.display = "block";
            document.querySelector('.mej-black-lapiz').style.display = "none";
        }
    }
}

document.querySelector('.Comprar-hierro').addEventListener('click', comprarMejoraHierro);

function venderMejoraHierro() {
    if (mejoraHierro >= 1) {
        contador += ValorHierro_V;
        mejoraHierro--;
        EsmeraldasXSegundo -= 50;
        ValorHierro_C = (ValorHierro_C - 100000);
        ValorHierro_V = (ValorHierro_V / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-hierro').innerHTML = "Comprar por " + (ValorHierro_C / 1000).toFixed(2) + "k $";
        document.getElementById('Vender-hierro').innerHTML = "Vender por " + (ValorHierro_V / 1000).toFixed(2) + "k $";
        document.getElementById('text-hierro').innerHTML = (mejoraHierro) + " Mejora de Hierro";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

    }
}

document.querySelector('.Vender-hierro').addEventListener('click', venderMejoraHierro);

function comprarMejoraLapiz() {
    if (contador >= ValorLapiz_C) {
        contador -= ValorLapiz_C;
        mejoraLapiz++;
        EsmeraldasXSegundo += 100;
        ValorLapiz_C = (ValorLapiz_C + 1000000);
        ValorLapiz_V = (ValorLapiz_C / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-lapiz').innerHTML = "Comprar por " + (ValorLapiz_C / 1000).toFixed(2) + "k $";
        document.getElementById('Vender-lapiz').innerHTML = "Vender por " + (ValorLapiz_V / 1000).toFixed(2) + "k $";
        document.getElementById('text-lapiz').innerHTML = (mejoraLapiz) + " Mejora de Lapizlazuli";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

        if (mejoraLapiz >= 10) {
            mejoraRedstoneDesbloqueada = true;
            document.querySelector('.mej-redstone').style.display = "block";
            document.querySelector('.mej-black-redstone').style.display = "none";
        }
    }
}

document.querySelector('.Comprar-lapiz').addEventListener('click', comprarMejoraLapiz);

function venderMejoraLapiz() {
    if (mejoraLapiz >= 1) {
        contador += ValorLapiz_V;
        mejoraLapiz--;
        EsmeraldasXSegundo -= 100;
        ValorLapiz_C = (ValorLapiz_C - 1000000);
        ValorLapiz_V = (ValorLapiz_V / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-lapiz').innerHTML = "Comprar por " + (ValorLapiz_C / 1000).toFixed(2) + "k $";
        document.getElementById('Vender-lapiz').innerHTML = "Vender por " + (ValorLapiz_V / 1000).toFixed(2) + "k $";
        document.getElementById('text-lapiz').innerHTML = (mejoraLapiz) + " Mejora de Lapizlazuli";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

    }
}

document.querySelector('.Vender-lapiz').addEventListener('click', venderMejoraLapiz);

function comprarMejoraRedstone() {
    if (contador >= ValorRedstone_C) {
        contador -= ValorRedstone_C;
        mejoraRedstone++;
        EsmeraldasXSegundo += 500;
        ValorRedstone_C = (ValorRedstone_C + 10000000);
        ValorRedstone_V = (ValorRedstone_C / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-redstone').innerHTML = "Comprar por " + (ValorRedstone_C / 1000000).toFixed(2) + "M $";
        document.getElementById('Vender-redstone').innerHTML = "Vender por " + (ValorRedstone_V / 1000000).toFixed(2) + "M $";
        document.getElementById('text-redstone').innerHTML = (mejoraRedstone) + " Mejora de Redstone";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

        if (mejoraRedstone >= 10) {
            mejoraOroDesbloqueada = true;
            document.querySelector('.mej-oro').style.display = "block";
            document.querySelector('.mej-black-oro').style.display = "none";
        }
    }
}

document.querySelector('.Comprar-redstone').addEventListener('click', comprarMejoraRedstone);

function venderMejoraRedstone() {
    if (mejoraRedstone >= 1) {
        contador += ValorRedstone_V;
        mejoraRedstone--;
        EsmeraldasXSegundo -= 500;
        ValorRedstone_C = (ValorRedstone_C - 10000000);
        ValorRedstone_V = (ValorRedstone_V / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-redstone').innerHTML = "Comprar por " + (ValorRedstone_C / 1000000).toFixed(2) + "M $";
        document.getElementById('Vender-redstone').innerHTML = "Vender por " + (ValorRedstone_V / 1000000).toFixed(2) + "M $";
        document.getElementById('text-redstone').innerHTML = (mejoraRedstone) + " Mejora de Redstone";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

    }
}

document.querySelector('.Vender-redstone').addEventListener('click', venderMejoraRedstone);

function comprarMejoraOro() {
    if (contador >= ValorOro_C) {
        contador -= ValorOro_C;
        mejoraOro++;
        EsmeraldasXSegundo += 1000;
        ValorOro_C = (ValorOro_C + 100000000);
        ValorOro_V = (ValorOro_C / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-oro').innerHTML = "Comprar por " + (ValorOro_C / 1000000).toFixed(2) + "M $";
        document.getElementById('Vender-oro').innerHTML = "Vender por " + (ValorOro_V / 1000000).toFixed(2) + "M $";
        document.getElementById('text-oro').innerHTML = (mejoraOro) + " Mejora de Oro";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

        if (mejoraOro >= 10) {
            mejoraDiamanteDesbloqueada = true;
            document.querySelector('.mej-diamante').style.display = "block";
            document.querySelector('.mej-black-diamante').style.display = "none";
        }
    }
}

document.querySelector('.Comprar-oro').addEventListener('click', comprarMejoraOro);

function venderMejoraOro() {
    if (mejoraOro >= 1) {
        contador += ValorOro_V;
        mejoraOro--;
        EsmeraldasXSegundo -= 1000;
        ValorOro_C = (ValorOro_C - 100000000);
        ValorOro_V = (ValorOro_V / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-oro').innerHTML = "Comprar por " + (ValorOro_C / 1000000).toFixed(2) + "M $";
        document.getElementById('Vender-oro').innerHTML = "Vender por " + (ValorOro_V / 1000000).toFixed(2) + "M $";
        document.getElementById('text-oro').innerHTML = (mejoraOro) + " Mejora de Oro";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

    }
}

document.querySelector('.Vender-oro').addEventListener('click', venderMejoraOro);

function comprarMejoraDiamante() {
    if (contador >= ValorDiamante_C) {
        contador -= ValorDiamante_C;
        mejoraDiamante++;
        EsmeraldasXSegundo += 1000;
        ValorDiamante_C = (ValorDiamante_C + 1000000000);
        ValorDiamante_V = (ValorDiamante_C / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-diamante').innerHTML = "Comprar por " + (ValorDiamante_C / 1000000).toFixed(2) + "M $";
        document.getElementById('Vender-diamante').innerHTML = "Vender por " + (ValorDiamante_V / 1000000).toFixed(2) + "M $";
        document.getElementById('text-diamante').innerHTML = (mejoraDiamante) + " Mejora de Diamante";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

        if (mejoraDiamante >= 10) {
            mejoraObsidianaDesbloqueada = true;
            document.querySelector('.mej-obsidiana').style.display = "block";
            document.querySelector('.mej-black-obsidiana').style.display = "none";
        }
    }
}

document.querySelector('.Comprar-diamante').addEventListener('click', comprarMejoraDiamante);

function venderMejoraDiamante() {
    if (mejoraDiamante >= 1) {
        contador += ValorDiamante_V;
        mejoraDiamante--;
        EsmeraldasXSegundo -= 1000;
        ValorDiamante_C = (ValorDiamante_C - 1000000000);
        ValorDiamante_V = (ValorDiamante_V / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-diamante').innerHTML = "Comprar por " + (ValorDiamante_C / 1000000).toFixed(2) + "M $";
        document.getElementById('Vender-diamante').innerHTML = "Vender por " + (ValorDiamante_V / 1000000).toFixed(2) + "M $";
        document.getElementById('text-diamante').innerHTML = (mejoraDiamante) + " Mejora de Diamante";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

    }
}

document.querySelector('.Vender-diamante').addEventListener('click', venderMejoraDiamante);

function comprarMejoraObsidiana() {
    if (contador >= ValorObsidiana_C) {
        contador -= ValorObsidiana_C;
        mejoraObsidiana++;
        EsmeraldasXSegundo += 15000;
        ValorObsidiana_C = (ValorObsidiana_C + 10000000000);
        ValorObsidiana_V = (ValorObsidiana_C / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-obsidiana').innerHTML = "Comprar por " + (ValorObsidiana_C / 1000000000).toFixed(2) + "B $";
        document.getElementById('Vender-obsidiana').innerHTML = "Vender por " + (ValorObsidiana_V / 1000000000).toFixed(2) + "B $";
        document.getElementById('text-obsidiana').innerHTML = (mejoraObsidiana) + " Mejora de Obsidiana";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

    }
}

document.querySelector('.Comprar-obsidiana').addEventListener('click', comprarMejoraObsidiana);

function venderMejoraObsidiana() {
    if (mejoraObsidiana >= 1) {
        contador += ValorObsidiana_V;
        mejoraObsidiana--;
        EsmeraldasXSegundo -= 15000;
        ValorObsidiana_C = (ValorObsidiana_C - 10000000000);
        ValorObsidiana_V = (ValorObsidiana_V / 2);
        document.getElementById('contador').innerHTML = contador + " ESMERALDAS";
        document.getElementById('Comprar-obsidiana').innerHTML = "Comprar por " + (ValorObsidiana_C / 1000000000).toFixed(2) + "B $";
        document.getElementById('Vender-obsidiana').innerHTML = "Vender por " + (ValorObsidiana_V / 1000000000).toFixed(2) + "B $";
        document.getElementById('text-obsidiana').innerHTML = (mejoraObsidiana) + " Mejora de Obsidiana";
        document.getElementById('contador').innerHTML = Math.floor(contador * 100) / 100 + " ESMERALDAS";

    }
}

document.querySelector('.Vender-obsidiana').addEventListener('click', venderMejoraObsidiana);

setInterval(function () {
    document.getElementById('Comprar-tronco').innerHTML = "Comprar por " + ValorTronco_C.toFixed(2) + " $";
    document.getElementById('Comprar-piedra').innerHTML = "Comprar por " + ValorPiedra_C.toFixed(2) + " $";
    document.getElementById('Comprar-carbon').innerHTML = "Comprar por " + (ValorCarbon_C / 1000).toFixed(2) + "k $";
    document.getElementById('Comprar-hierro').innerHTML = "Comprar por " + (ValorHierro_C / 1000).toFixed(2) + "k $";
    document.getElementById('Comprar-lapiz').innerHTML = "Comprar por " + (ValorLapiz_C / 1000).toFixed(2) + "k $";
    document.getElementById('Comprar-redstone').innerHTML = "Comprar por " + (ValorRedstone_C / 1000000).toFixed(2) + "M $";
    document.getElementById('Comprar-oro').innerHTML = "Comprar por " + (ValorOro_C / 1000000).toFixed(2) + "M $";
    document.getElementById('Comprar-diamante').innerHTML = "Comprar por " + (ValorDiamante_C / 1000000).toFixed(2) + "M $";
    document.getElementById('Comprar-obsidiana').innerHTML = "Comprar por " + (ValorObsidiana_C/ 1000000000).toFixed(2) + "B $";
    document.getElementById('Vender-tronco').innerHTML = "Vender por " + ValorTronco_V.toFixed(2) + " $";
    document.getElementById('Vender-piedra').innerHTML = "Vender por " + ValorPiedra_V.toFixed(2) + " $";
    document.getElementById('Vender-carbon').innerHTML = "Vender por " + (ValorCarbon_V / 1000).toFixed(2) + "k $";
    document.getElementById('Vender-hierro').innerHTML = "Vender por " + (ValorHierro_V / 1000).toFixed(2) + "k $";
    document.getElementById('Vender-lapiz').innerHTML = "Vender por " + (ValorLapiz_V / 1000).toFixed(2) + "k $";
    document.getElementById('Vender-redstone').innerHTML = "Vender por " + (ValorRedstone_V / 1000000).toFixed(2) + "M $";
    document.getElementById('Vender-oro').innerHTML = "Vender por " + (ValorOro_V / 1000000).toFixed(2) + "M $";
    document.getElementById('Vender-diamante').innerHTML = "Vender por " + (ValorDiamante_V / 1000000).toFixed(2) + "M $";
    document.getElementById('Vender-obsidiana').innerHTML = "Vender por " + (ValorObsidiana_V / 1000000000).toFixed(2) + "B $";
}, 1000);

