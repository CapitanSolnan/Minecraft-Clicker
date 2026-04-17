// ── Estado global
let contador = 0;
let timer = 0;

// ── Configuración de mejoras
//
//  clickBonus       → esmeraldas EXTRA por click manual (además del +1 base)
//  pasivoPorUnidad  → esmeraldas/segundo que da CADA unidad comprada
//  costeBase / costePaso → precio inicial y cuánto sube por compra
//  escala / sufijo  → para formatear el precio en pantalla
//  desbloquea       → id de la siguiente mejora (se abre al llegar a 10 unidades)
//  oculto           → empieza oculta hasta que la anterior la desbloquee
//
//  BALANCE:
//   Tronco    → +1 click                   (baratos, muchos)
//   Piedra    → +5 click                   (x10 precio, x5 bonus click)
//   Carbón    → +2 /seg +5 click           (primer pasivo, barato para introducirlo)
//   Hierro    → +10 /seg +10 click         (x50 precio, x5 pasivo)
//   Lapizlaz  → +50 /seg +10 click         (x10 precio, x5 pasivo)
//   Redstone  → +250 /seg +50 click        (x10 precio, x5 pasivo)
//   Oro       → +1 250 /seg +50 click      (x10 precio, x5 pasivo)
//   Diamante  → +6 250 /seg +250 click     (x10 precio, x5 pasivo)
//   Obsidiana → +31 250 /seg +250 click    (x10 precio, x5 pasivo)
// ─────────────────────────────────────────────────────────────
const MEJORAS = [    {
        id: 'tronco',
        nombre: 'Tronco',
        costeBase:  10,
        costePaso:  10,
        clickBonus: 1,
        pasivoPorUnidad: 0,
        escala: 1,
        sufijo: ' $',
        desbloquea: 'piedra',
        oculto: false,
    },
    {
        id: 'piedra',
        nombre: 'Piedra',
        costeBase:  100,
        costePaso:  100,
        clickBonus: 5,
        pasivoPorUnidad: 0,
        escala: 1,
        sufijo: ' $',
        desbloquea: 'carbon',
        oculto: true,
    },
    {
        id: 'carbon',
        nombre: 'Carbón',
        costeBase:  1_000,
        costePaso:  500,
        clickBonus: 5,
        pasivoPorUnidad: 2,
        escala: 1_000,
        sufijo: 'k $',
        desbloquea: 'hierro',
        oculto: true,
    },
    {
        id: 'hierro',
        nombre: 'Hierro',
        costeBase:  50_000,
        costePaso:  25_000,
        clickBonus: 10,
        pasivoPorUnidad: 10,
        escala: 1_000,
        sufijo: 'k $',
        desbloquea: 'lapiz',
        oculto: true,
    },
    {
        id: 'lapiz',
        nombre: 'Lapizlazuli',
        costeBase:  500_000,
        costePaso:  250_000,
        clickBonus: 10,
        pasivoPorUnidad: 50,
        escala: 1_000,
        sufijo: 'k $',
        desbloquea: 'redstone',
        oculto: true,
    },
    {
        id: 'redstone',
        nombre: 'Redstone',
        costeBase:  5_000_000,
        costePaso:  2_500_000,
        clickBonus: 50,
        pasivoPorUnidad: 250,
        escala: 1e6,
        sufijo: 'M $',
        desbloquea: 'oro',
        oculto: true,
    },
    {
        id: 'oro',
        nombre: 'Oro',
        costeBase:  50_000_000,
        costePaso:  25_000_000,
        clickBonus: 50,
        pasivoPorUnidad: 1_250,
        escala: 1e6,
        sufijo: 'M $',
        desbloquea: 'diamante',
        oculto: true,
    },
    {
        id: 'diamante',
        nombre: 'Diamante',
        costeBase:  500_000_000,
        costePaso:  250_000_000,
        clickBonus: 250,
        pasivoPorUnidad: 6_250,
        escala: 1e6,
        sufijo: 'M $',
        desbloquea: 'obsidiana',
        oculto: true,
    },
    {
        id: 'obsidiana',
        nombre: 'Obsidiana',
        costeBase:  5_000_000_000,
        costePaso:  2_500_000_000,
        clickBonus: 250,
        pasivoPorUnidad: 31_250,
        escala: 1e9,
        sufijo: 'B $',
        desbloquea: null,
        oculto: true,
    },
];

// ── Estado dinámico (se construye desde MEJORAS)
const estado = {};
MEJORAS.forEach(m => {
    estado[m.id] = {
        cantidad:     0,
        coste:        m.costeBase,
        venta:        m.costeBase / 2,
        desbloqueada: !m.oculto,
    };
});

// ── Calcular totales desde el estado (fuente de verdad)
function calcularPasivo() {
    return MEJORAS.reduce((sum, m) =>
        sum + estado[m.id].cantidad * m.pasivoPorUnidad, 0);
}

function calcularBonusClick() {
    return MEJORAS.reduce((sum, m) =>
        sum + estado[m.id].cantidad * m.clickBonus, 0);
}

// ── Formato
function formatearPrecio(valor, escala, sufijo) {
    return (valor / escala).toFixed(2) + sufijo;
}

function formatearContador(n) {
    return Math.floor(n * 100) / 100 + ' ESMERALDAS';
}

// ── Renderizado
function actualizarUI() {
    const pasivo     = calcularPasivo();
    const bonusClick = calcularBonusClick();

    document.getElementById('contador').innerHTML = formatearContador(contador);
    document.getElementById('xseg').innerHTML =
        pasivo + ' /seg  |  +' + (1 + bonusClick) + ' por click';
}

function actualizarMejoraUI(m) {
    const e = estado[m.id];
    document.getElementById('text-' + m.id).innerHTML =
        e.cantidad + ' Mejora de ' + m.nombre;
    document.getElementById('Comprar-' + m.id).innerHTML =
        'Comprar por ' + formatearPrecio(e.coste, m.escala, m.sufijo);
    document.getElementById('Vender-' + m.id).innerHTML =
        'Vender por ' + formatearPrecio(e.venta, m.escala, m.sufijo);
}

function desbloquearMejora(id) {
    if (!id) return;
    const e = estado[id];
    if (e.desbloqueada) return;
    e.desbloqueada = true;
    document.querySelector('.mej-' + id).style.display = 'block';
}

// ── Compra / Venta
function comprar(m) {
    const e = estado[m.id];
    if (contador < e.coste) return;

    contador  -= e.coste;
    e.cantidad++;
    e.coste   += m.costePaso;
    e.venta    = e.coste / 2;

    actualizarMejoraUI(m);
    actualizarUI();

    if (e.cantidad >= 10) desbloquearMejora(m.desbloquea);
}

function vender(m) {
    const e = estado[m.id];
    if (e.cantidad < 1) return;

    contador  += e.venta;
    e.cantidad--;
    e.coste   -= m.costePaso;
    e.venta    = e.coste / 2;

    actualizarMejoraUI(m);
    actualizarUI();
}

// Registrar listeners
MEJORAS.forEach(m => {
    document.getElementById('Comprar-' + m.id).addEventListener('click', function() { comprar(m); });
    document.getElementById('Vender-'  + m.id).addEventListener('click', function() { vender(m); });
});

// ── Click manual
document.getElementById('click').addEventListener('click', function() {
    contador += 1 + calcularBonusClick();
    actualizarUI();
});

// ── Tick por segundo
setInterval(function() {
    timer++;
    contador += calcularPasivo();   // recalcula siempre desde el estado real

    document.getElementById('timer').innerHTML = 'Tiempo transcurrido: ' + timer;
    actualizarUI();

    MEJORAS.forEach(function(m) {
        if (estado[m.id].desbloqueada) actualizarMejoraUI(m);
    });
}, 1000);

// ── Guardar progreso
document.querySelector('.guardar').addEventListener('click', function() {
    var save = { contador: contador, timer: timer, estado: {} };
    MEJORAS.forEach(function(m) {
        save.estado[m.id] = {
            cantidad:     estado[m.id].cantidad,
            coste:        estado[m.id].coste,
            venta:        estado[m.id].venta,
            desbloqueada: estado[m.id].desbloqueada,
        };
    });

    var blob = new Blob([JSON.stringify(save)], { type: 'text/plain;charset=utf-8' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href     = url;
    a.download = 'gameProgress.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// ── Cargar progreso
document.querySelector('.cargar').addEventListener('change', function(event) {
    var file = event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var save = JSON.parse(e.target.result);

            contador = save.contador || 0;
            timer    = save.timer    || 0;

            if (save.estado) {
                // Formato nuevo
                MEJORAS.forEach(function(m) {
                    if (save.estado[m.id]) {
                        estado[m.id].cantidad     = save.estado[m.id].cantidad;
                        estado[m.id].coste        = save.estado[m.id].coste;
                        estado[m.id].venta        = save.estado[m.id].venta;
                        estado[m.id].desbloqueada = save.estado[m.id].desbloqueada;
                    }
                });
            } else {
                // Compatibilidad con guardados del código original
                cargarFormatoAntiguo(save);
            }

            // Aplicar visibilidad y refrescar UI
            MEJORAS.forEach(function(m) {
                if (estado[m.id].desbloqueada) desbloquearMejora(m.id);
                actualizarMejoraUI(m);
            });
            actualizarUI();

        } catch (err) {
            console.error('Error al cargar el progreso:', err);
        }
    };
    reader.readAsText(file);
});

function cargarFormatoAntiguo(save) {
    var mapa = {
        tronco:    { cantidad: 'mejoraTronco',    coste: 'ValorTronco_C',    venta: 'ValorTronco_V',    des: null },
        piedra:    { cantidad: 'mejoraPiedra',    coste: 'ValorPiedra_C',    venta: 'ValorPiedra_V',    des: 'mejoraPiedraDesbloqueada' },
        carbon:    { cantidad: 'mejoraCarbon',    coste: 'ValorCarbon_C',    venta: 'ValorCarbon_V',    des: 'mejoraCarbonDesbloqueada' },
        hierro:    { cantidad: 'mejoraHierro',    coste: 'ValorHierro_C',    venta: 'ValorHierro_V',    des: 'mejoraHierroDesbloqueada' },
        lapiz:     { cantidad: 'mejoraLapiz',     coste: 'ValorLapiz_C',     venta: 'ValorLapiz_V',     des: 'mejoraLapizDesbloqueada' },
        redstone:  { cantidad: 'mejoraRedstone',  coste: 'ValorRedstone_C',  venta: 'ValorRedstone_V',  des: 'mejoraRedstoneDesbloqueada' },
        oro:       { cantidad: 'mejoraOro',       coste: 'ValorOro_C',       venta: 'ValorOro_V',       des: 'mejoraOroDesbloqueada' },
        diamante:  { cantidad: 'mejoraDiamante',  coste: 'ValorDiamante_C',  venta: 'ValorDiamante_V',  des: 'mejoraDiamanteDesbloqueada' },
        obsidiana: { cantidad: 'mejoraObsidiana', coste: 'ValorObsidiana_C', venta: 'ValorObsidiana_V', des: 'mejoraObsidianaDesbloqueada' },
    };
    MEJORAS.forEach(function(m) {
        var k = mapa[m.id];
        if (save[k.cantidad] !== undefined) estado[m.id].cantidad    = save[k.cantidad];
        if (save[k.coste]    !== undefined) estado[m.id].coste       = save[k.coste];
        if (save[k.venta]    !== undefined) estado[m.id].venta       = save[k.venta];
        if (k.des && save[k.des] !== undefined) estado[m.id].desbloqueada = save[k.des];
        else if (!k.des) estado[m.id].desbloqueada = true;
    });
}