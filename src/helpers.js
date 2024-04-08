export function minMax(val, min, max){
    if(isNaN(val)) val = min;
    return  Math.max( Math.min(val, max), min )
}

export function num2str(number, titles, digs=2) {
    let num = number
    number = Math.abs(number)
    const out = num.toLocaleString(undefined, {maximumFractionDigits: digs});
    number = Math.floor( number )
    const cases = [2, 0, 1, 1, 1, 2];
    return `${out} ${titles[number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]]}`;
}
export const num3f = Intl.NumberFormat('ru', { notation: 'compact', maximumFractionDigits:3 }).format
export const num2f = Intl.NumberFormat('ru', { notation: 'compact', maximumFractionDigits:2 }).format
export const num16f = Intl.NumberFormat('ru', { maximumSignificantDigits: 16 }).format

// export const numNormalize = num=> isNaN(num)? def:(num>100000000000000000)?'∞':num;

/*export function bigNum(num ) {

    let title = num = numNormalize(num)
    return `<i hint="${title}">${num3f(num)}</i>`
}*/

// export const big_Num = num =>`<i hint="${ num = numNormalize(num)}">${num3f(num)}</i>`
//
// export function bigPercents(num) {
//
//     let title = num = numNormalize(num)
//     return `<i hint="${title}">${num2f(num*100)}%</i>`
// }

export function toDays( d ) {
    return num2str( d, ['день', 'дня', 'дней'])
}
var _base_ =  'https://trademeter.4848.site/'
var _api_base_ = _base_+'api/';

export async function jget(get, data={} ){

    if ( 'do' in get ) {
        data = get;
        get = _api_base_
    }
    const res = await fetch(get, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify(data)
    });
    return await res.json();
}

export function cloneDeep( data ){
    return JSON.parse(JSON.stringify( data ))
}

export function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}
