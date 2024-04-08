// CHANGELOG
// 3.2 - realdata, dayoffirstpayload, dayoffirstpayload   do   ZERO based !
// 3.21 - change to ||
// 3.22 - change to baseRate
// 3.4 - adding averageProf
// 4.0 - adding bond profit
// 4.1 - simple bond


export function extRateReal(present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment=1, dayoffirstpayload=1, comission = 0, realdata = {}, options = {customRate_: undefined, fmode: 0, tax: 0.13, getAverage: false, acr: false } ) {

    ////////////////////////
    //  Version 4.3 beta  //
    ////////////////////////

    // ( Начальный депозит, Целевой депозит, Сумма на вывод, Периодичность вывода, Сумма на добавление, Периодичность добавления, Торговых дней, День от начала до первого вывода, День от начала до первого взноса (с самого начала - 1), комиссия на вывод, массив данных по реальным дням, Опции: { extendDays -> коллбэк функция, которая вызывается если не хватает дней для достижения цели, customRate_ -> Предлагаемая доходность, на основе которой расчитывается отставание / опережение графика}  )
    // bond = { price, coupon, frequency, startDateCoupon, date }
    // Возвращает: { rate_ -> Минимальная доходность в день, rateRecommended -> базовая доходность без учета рилдата, extraDays -> дополнительные дни при необходимости, daysDiff -> разница в днях между планом и реальностью, future -> цель, sum -> итоговая сумма, periods_ -> дней фактически, ndflSum -> сумма НДФЛ}

    // точность в процентах от итоговой суммы
    let deltaMaxPercent = 0.000005;

    // максимальное количество итераций
    let iterMax = 1800;

    // ставка НДФЛ
    const NDFL = options.tax || 0.13;
    const extraDaysMode0 = options.extraDaysMode0 || 0;

    payment = payment * (1 + comission);

    // костыль для в. 3.2
    const RD_modifier = 0; // 0 to my front
    // const RD_modifier = -1; // realdata[0] - same realdata[1] in past
    // dayoffirstpayment++;
    // dayoffirstpayload++;

    // костыль для отрицательных процентов
    const rateInc = 100000;

    var negativeGrow = ( present >=future );

    var cash = present; //добавляем кэш на будущее для исп в паре с бондами

    let marginCall_ = false;

    const bonds2 = {
        cash: 0,
        bondsTotal: 0,
        get total(){
            return this.cash + this.bondsTotal;
        },

        init(opts, cash){
            this.opts = opts;
            this.cash = cash;
            this.bondsTotal = 0;
            this.uB( cash );
        },

        uB(s){
            //return s;
            if ( isNaN(s) ) { return s; }
            var d = s - this.total;
            //if ( d!= 0) console.log('d != 0 ');//t

            //console.log('s', s, 'd', d,'CR',this.opts.couponRate); // t

            this.cash += this.bondsTotal * (1 + this.opts.couponRate) + d;

            //console.log('cash', this.cash); // t

            if (this.cash < 0) {
                this.cash = 0;
                this.bondsTotal = 0;
            }
            else  {
                if (this.cash >= this.opts.price) {
                    let t = this.cash % this.opts.price;
                    this.bondsTotal = this.cash - t;
                    this.cash = t;
                }
            }
            if ( isNaN(s) ) { console.log( this.total );  }
            return this.total;
        }

    }

    function paymentByFixedRate(rate, periods){
        return present*((1+rate)**(periods))+payload/payloadper*periods-present
    }

    function maxPaymentCalc(){

        let k, v1, v2;

        let p = periods

        // payload = payload

        let paymentRatio = (paymentper) / ( payload /payloadper)
        let payloadRatio = (payloadper) / (payment/paymentper)

        v1 = present * 30 * (1 / ((p/9)**2) );

        // let temp = 5*(main.present_* ( (main.future_/main.present_)**(1/(main.periods_ / main.paymentper_)) -1 ) )
        let v2_payment = 5*(present* ( (future/present)**(1/(periods / paymentper)) -1 ) )
        let v2_payload = 5*(present* ( (future/present)**(1/(periods / payloadper)) -1 ) )

        // let pmt = ((present*((1+rate)**(payloadper))) - present * (1 + rate)**(payloadper)) / ((1 + rate)**(payloadper) - 1) * (1/rate)


        return  {
            pml: ( 0.8*v1 + 0.4*v2_payment ) + payload * paymentper/payloadper,
            pll: ( 0.8*v1 + 0.4*v2_payload ) + paymentper * payloadper/paymentper,
            // pmt: pmt,

        } //* minMax((  p * 4000 / main.present_)+1, 1, 2)
    }

    function maxPaymentCalc2(){
        // let base = ((options.customRate_)**paymentper)*present
        // let pmt = ((1 + payload / present)**(1/payloadper)-1)*present
    }

    let maxPayments = maxPaymentCalc()

    //bond = { price, income, frequency, dateCoupon }


    ///////////////////////////////////////////
    function ff(rate, periods, present, payment, paymentper, payload, payloadper, p1 = 1, p2 = 1, realdata = []) {
        //    var p1 = dayoffirstpayment;
        //    var p2 = dayoffirstpayload;

        var res = present;

        if ( options.bond !== undefined ) {
            bonds2.init(options.bond, present);
            //	console.log( present, bonds2.total, bonds2.cash, bonds2.bondsTotal );
        }

        rate += 1;
        for (let x = 1; x <= periods; x++) {
            if ( realdata[x + RD_modifier]!== undefined ) {
                res = res * (1 + realdata[x + RD_modifier].scale);
                res += realdata[x + RD_modifier].payload - realdata[x + RD_modifier].payment;
                if (!--p2) { p2 = payloadper; }
                if (!--p1) { p1 = paymentper; }
            } else {
                res = res * rate;
                if (!--p2) { p2 = payloadper; res += payload; }
                if (!--p1) { p1 = paymentper; res -= payment; }
            }

            if ( options.bond !== undefined ) {
                //console.log( 'bef', res );
                res = bonds2.uB( res );
                //console.log( 'aft', res );
            }
            if (res<0) {
                res=0;
            }

        }
        return res;
    }
    function ff3(rate, periods, present, payment, paymentper, payload, payloadper, p1 = 1, p2 = 1, realdata = []) {
        var res = present;

        if ( options.bond !== undefined ) {
            bonds2.init(options.bond, present);
        }

        rate += 1;
        for (var x = 1; x <= periods; x++) {
            res = res * rate;
            if ( realdata[x + RD_modifier]!== undefined ) {
                res += realdata[x + RD_modifier].payload - realdata[x + RD_modifier].payment;
                if (!--p2) { p2 = payloadper; }
                if (!--p1) { p1 = paymentper; }
            } else {
                if (!--p2) { p2 = payloadper; res += payload; }
                if (!--p1) { p1 = paymentper; res -= payment; }
            }

            if ( options.bond !== undefined ) {
                res = bonds2.uB( res );
            }
            if (res<0) {
                res=0;
            }

        }
        return res;
    }
    function ffFull(rate, periods, present, payment, paymentper, payload, payloadper, p1 = 1, p2 = 1, realdata = []) {
        //    var p1 = dayoffirstpayment;
        //    var p2 = dayoffirstpayload;

        var res = present;

        if ( options.bond !== undefined ) {
            bonds2.init(options.bond, present);
        }

        var ndflSum = 0;
        var purePayment = 0;
        var purePayload = 0;
        rate += 1;
        var factDay = -1;
        for (var x = 1; x <= periods; x++) {
            if (res<0) {
                res=0;
            }
            if ( realdata[x + RD_modifier]!== undefined ) {
                // console.log(x,realdata[x + RD_modifier])
                res = res * (1 + realdata[x + RD_modifier].scale);
                res += realdata[x + RD_modifier].payload - realdata[x + RD_modifier].payment;
                purePayload += realdata[x + RD_modifier].payload;
                purePayment += realdata[x + RD_modifier].payment;
                if (!--p2) { p2 = payloadper; }
                if (!--p1) { p1 = paymentper; }
            } else {
                res = res * rate;
                if (!--p2) {
                    p2 = payloadper;
                    res += payload;
                    purePayload += payload;
                }
                if (!--p1) {
                    p1 = paymentper;
                    res -= payment;
                    purePayment += payment;
                }
            }

            if ( options.bond !== undefined ) {
                res = bonds2.uB( res );
            }

            if ( options.customRate_ === undefined ) { if (res >= future && factDay==-1) factDay = x; }
            else if ( x > lastRDDay && res >= future && factDay==-1 ) factDay = x;

            if (res<0) {
                res=0;
                if (!marginCall_) marginCall_ = x;
            }

            // console.log

        }
        const realDays= x;
        x--;
        let extraDays = 0;
        let sumPeriod = res;

        let t = 0;

        if ( negativeGrow && options.customRate_ === undefined ) {
            if ( lastRDDay >= periods ) t = 9999;
            else t = 10000;
        }

        while(res<future && t<10000 && res>=-payload) {
            t++;
            extraDays++;
            res = res * rate;
            if (!--p2) {
                p2 = payloadper;
                res += payload;
                purePayload += payload;
            }
            if (!--p1) {
                p1 = paymentper;
                res -= payment;
                purePayment += payment;
            }

            if ( options.bond !== undefined ) {
                res = bonds2.uB( res );
            }

            if (res<0) {
                res=0;
                if (!marginCall_) marginCall_ = x;
            }

        }

        ndflSum = purePayment * NDFL;
        purePayment = purePayment - ndflSum;
        if (factDay === -1) factDay = x+extraDays;
        if (res<0) res=0;
        return {sumPeriod, sum: res, extraDays, factDay, periods_:x+extraDays, daysDiff: factDay-periods, ndflSum, purePayment_: purePayment, purePayload_: purePayload, realDays, marginCall_};
    }

    function getRate(realdata=[]){
        var minrate = 0;
        var maxrate = 0;
        var current = ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

        var negativeFlag = false;

        while (((current > (future + deltaMax)) || (current < future)) && (iterMax > 0)) {
            current = ff(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

            if ( rate < 0 ) {
                negativeFlag = true;
                rate += rateInc;
                maxrate += rateInc;
                minrate += rateInc;
            }

            if (current > (future + deltaMax)) {
                maxrate = rate;
                rate = minrate + (maxrate - minrate) / 2;
            }
            if (current < future) {
                minrate = rate;
                if (maxrate === 0) rate = rate * 2;
                else rate = minrate + (maxrate - minrate) * 2;
            }
            iterMax--;

            if ( negativeFlag ) {
                negativeFlag = false;
                rate -= rateInc;
                maxrate -= rateInc;
                minrate -= rateInc;
            }

            //console.log('---', current, rate_);

        }
        return rate;
    }

    function getRate2(realdata=[]){
        var minrate = 0;
        var maxrate = 0;
        let rate = 100000;
        let iterMax = 30;
        var current = ff(options.customRate_, periods, present, rate, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

        var negativeFlag = false;

        while (((current > (present + deltaMax)) || (current < (present-deltaMax))) && (iterMax > 0)) {
            current = ff(options.customRate_, periods, present, rate, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

            if ( rate < 0 ) {
                negativeFlag = true;
                rate += rateInc;
                maxrate += rateInc;
                minrate += rateInc;
            }

            if (current < (present + deltaMax)) {
                maxrate = rate;
                rate = minrate + (maxrate - minrate) / 2;
            }
            if (current > (present - deltaMax) )  {
                minrate = rate;
                if (maxrate === 0) rate = rate * 2;
                else rate = minrate + (maxrate - minrate) * 2;
            }
            iterMax--;

            if ( negativeFlag ) {
                negativeFlag = false;
                rate -= rateInc;
                maxrate -= rateInc;
                minrate -= rateInc;
            }

            // console.log('---', current, rate);

        }
        return rate;
    }

    var deltaMax = future * deltaMaxPercent / 100;
    var guess = (((future + periods * (payment)) / present) ** (1 / periods)) - 1;
    var delta = guess;
    var rate = guess;
    var daysExtend = 0;

    var averageRate = 0;

    var rateRecommended = 0;

    var current = 0;

    let maxPayment;

    var drd = 0;
    var rdgtp = false;
    var lastRDDay = -1;
    for (var x = 1; x <= periods; x++) {
        if ( realdata[x + RD_modifier]!== undefined ) {
            drd++;
            lastRDDay = x;
            averageRate += realdata[x + RD_modifier].scale;
        }
    }
    averageRate = averageRate / drd;

    var averageProf = 'not calculating';
    if ( options.getAverage ) var averageProf = ff(averageRate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

    if (drd >= periods) rdgtp = true;

    if ( options.customRate_ !== undefined ) {

        if ( options.customFuture === undefined ) {
            future = ff3(options.customRate_, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload ); //,realdata
        } else {
            future = options.customFuture;
        }
        negativeGrow = ( present >=future );

        if (drd >= periods) rateRecommended = options.customRate_;
        else rateRecommended = getRate(realdata);

        current = ffFull(options.customRate_, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

        if (current.sum == 0) { console.log('вход в пустоту');
            rateRecommended = 0.3;
            // current = ffFull(rateRecommended, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);
        }

        if ( !rdgtp && !extraDaysMode0) current.extraDays = 0;

        // maxPayments.pml = Math.min(  paymentByFixedRate( options.customRate_, paymentper  ), maxPayments.pml*2000);
        // maxPayments.pml = Math.max( --maxPayments.pml, 0);
        maxPayments.pml = Math.min( getRate2(), maxPayments.pml * 2000);
        maxPayments.pml = Math.max( --maxPayments.pml, 0);
        return { ...current, rate_: options.customRate_, rateRecommended_: rateRecommended, future_: future, averageRate, averageProf, maxPayment:maxPayments.pml };
        //return { rate_: options.customRate_, extraDays: current.extraDays, rateRecommended, daysDiff: current.daysDiff, future, sum: current.sum, periods_: current.periods_, ndflSum: current.ndflSum, purePayment_: current.purePayment_, purePayload: current.purePayload, averageRate, averageProf };
    }

    var baseRate = options.customBaseRate || getRate();

    if (drd >= periods) rateRecommended = baseRate;
    else rateRecommended = getRate(realdata);

    current = ffFull(options.acr?rateRecommended:baseRate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment, dayoffirstpayload, realdata);

    if ( !rdgtp && !extraDaysMode0) current.extraDays = 0;

    maxPayments.pml = Math.max( --maxPayments.pml, 0);

    return { ...current, rate_: baseRate, rateRecommended_: rateRecommended, future_: future, averageRate, averageProf, maxPayment:maxPayments.pml };
    //return {rate_: baseRate, rateRecommended, extraDays: current.extraDays, daysDiff: current.daysDiff, future, sum: current.sum, periods_: current.periods_, ndflSum: current.ndflSum, purePayment_: current.purePayment_, purePayload: current.purePayload, averageRate, averageProf };
}

// Возвращает: { rate_ -> Минимальная доходность в день, rateRecommended -> базовая доходность без учета рилдата, extraDays -> дополнительные дни при необходимости, daysDiff -> разница в днях между планом и реальностью, future -> цель, sum -> итоговая сумма, periods_ -> дней фактически, ndflSum -> сумма НДФЛ}

///////////////////////////
//  ^ END extRateReal ^  //
///////////////////////////

// ...current, rate_: options.customRate_, rateRecommended, future_, averageRate, averageProf
// ...current, rate_: baseRate, rateRecommended, future_, averageRate, averageProf
//   sumPeriod, sum: res, extraDays, factDay, periods_:x+extraDays, daysDiff: factDay-periods_, ndflSum, purePayment_, purePayload
