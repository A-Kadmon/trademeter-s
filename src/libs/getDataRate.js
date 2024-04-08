
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

        //console.log('s', s, 'd', d,'CR',this.opts.couponRate); // t

        this.cash += this.bondsTotal * (1 + this.opts.couponRate) + d;

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

export function getDataRate(
    rate,
    present, future,
    payment, paymentper,
    payload, payloadper,
    periods,
    dayoffirstpayment = 1, dayoffirstpayload = 1,
    comission = 0,
    realdata = [],
    options = {
        use:{
            RD_scale: false,
            RD_pays: false,
            bonds: false,
            RD: true
        },
        customRate: undefined,
        bond: undefined
    }
)
{

    let correctRD = (
        typeof realdata === 'object' &&
        !Array.isArray(realdata) &&
        realdata !== null &&
        Object.keys(realdata).length > 0
    )

    if (!options.RD) realdata = {}
    const mode2 = options.customRate;
    const useRD_scale = options.RD && options.use.RD_scale && correctRD ;
    const useRD_pays = options.RD && options.use.RD_pays && correctRD;
    const useRD_bonds = options.use.bonds && options.bond!==undefined;

    let res = present;

    // для в 4.1
    if (options.bond !== undefined) {
        bonds2.init(options.bond, present);
        //console.log( 'gdr',present, bonds2.total, bonds2.cash, bonds2.bondsTotal );
    }

    // костыль для в. 3.2
    // dayoffirstpayment++;
    // dayoffirstpayload++;
    /////

    let p1 = dayoffirstpayment;
    let p2 = dayoffirstpayload;
    let x = 1;
    const RD_modifier = 0; //-1

    let arr = [];
    if (RD_modifier === 0) arr = [present];

    rate += 1;
    payment = payment * (1 + (comission||0));

    console.log(payment)

    while (x <= periods) {
        if (realdata[x] !== undefined) {

            console.log( 'RD')
            if (useRD_scale) res = res * (1 + realdata[x].scale);
            else res = res * rate;
            p1--;
            p2--;
            if( useRD_pays) {
                res += realdata[x].payload;
                res -= realdata[x].payment;
            }
            if (!p2) {
                p2 = payloadper;
            }
            if (!p1) {
                p1 = paymentper;
            }
        } else {
            // console.log('pays plan')
            res = res * rate;
            p1--;
            p2--;
            if (!p2) {
                p2 = payloadper;
                res += payload;
            }
            if (!p1) {
                p1 = paymentper;
                res -= payment;
            }
        }
        x++;

        if ( useRD_bonds && options.bond !== undefined) {
            res = bonds2.uB(res);
        }

        if (res < 0) {
            res = 0;
            arr.push(res);
            break;
        }

        arr.push(res);
    }
    return arr;
}

