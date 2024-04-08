// bond = {
// 		price,   	 				// цена ОФЗ
//      couponRate,				// ставка выплаты по купону в день, например, 0.01. Если установлена, то "coupon", "frequency", "startDateCoupon" не используются
// 		coupon,  	 				// величина выплаты по купону
// 		frequency, 				// периодичность выплаты по купону в днях
// 		startDateCoupon, 	// в этой версии не используется. Зарезервировано для другой версии // первый день с которого идет первая выплата по купону, если поставить 0, то "startDateCoupon" автоматически устанавливается равен "frequency"
// 		date 							// в этой версии не используется. Зарезервировано для другой версии // дата выпуска ОФЗ
// }

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
        let d = s - this.total;
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

//bond = { price, income, frequency, dateCoupon }
