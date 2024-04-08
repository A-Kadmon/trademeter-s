<script>

    import Linp from "./libs/Linp.svelte";
    // import NumSelect from "./libs/NumSelect.svelte";
    import {

        cloneDeep,
        debounce,
        jget,
        num2str, num3f,
        toDays,
        minMax
        // toolTips
    } from "./helpers";
    import RangeL from "./libs/RangeL.svelte";
    import {extRateReal} from "./libs/extRateReal";
    import {onMount} from "svelte";
    import {dailyToIters} from "./libs/tradeFunctions";
    import {tradeTools} from "./data/tools";
    import RealdataFields from "./RealdataFields.svelte";
    import CircleProgress from "./libs/CircleProgress.svelte";
    import Select from "./libs/Select.svelte";
    import Switch from "./libs/Switch.svelte";
    import ChartControlCard from "./libs/ChartControlCard.svelte";
    import {getDataRate} from "./libs/getDataRate";
    // import ChartLW from "./ChartLW.svelte";
    // import ChartLW2 from "./ChartLW2.svelte";
    import Chartjs from "./Chartjs.svelte";
    import FN from "./libs/FN.svelte";
    import AddableList from "./libs/AddableList.svelte";

    // toolTips();


    // start consts

    let file={
        name: 'Трейдометр',
        uid: 0
    }

    let main = {
        present_: 1000000,
        future_: 3000000,
        payment_: 0,
        paymentper_: 20,
        payload_: 0,
        payloadper_: 20,
        periods_: 260,
    };

    let options={
        customRate_: 0.01,
        baseRate: 0.01,
        comission: 0,
        passive: 0,
        passiveIstrument: 'Не выбран'
    }

    let iters={
        percent: 10,
        quantity: 10
    }

    let realData = undefined;
    let bonds = undefined;

    let calc={
        sumPeriod: 3000000,
        sum: 3000000,
        extraDays: 0,
        factDay: 260,
        periods_: 260,
        daysDiff: 0,
        ndflSum: 0,
        purePayment_: 0,
        purePayload_: 0,
        rate_: 0.0042343716,
        rateRecommended_: 0.0042343716,
        future_: 3000000,
        averageRate: null,
        averageProf: null,
        marginCall_: false
    };

    let graphs = {
        1: {
            show: true,
            freeze: false,
            RD_scale: false,
            RD_pays: false,
            bonds: false,
        },
        2: {
            show: false,
            freeze: false,
            RD_scale: false,
            RD_pays: false,
            bonds: false,
        },
        3: {
            show: false,
            freeze: false,
            RD_scale: false,
            RD_pays: false,
            bonds: false,
        }
    }

    let use = {
        realData: true,
        bonds: false
    }

    let daysConfList={
        50:'',
        100:'',
        260:'( 1 год )',
        520:'(2 года)',
        780:'(3 года)',
        1040:'(4 года)',
        1300:'(5 года)'
    }

    let rezhim = true; // tr = 'summ';

    let curDay = 1;

    let planData =[];

    // trade tools
    let razgrPryam=false;

    let curTradeTool = tradeTools[0];

    // end consts


    let temp=1;

    let saveVersion=2;


    // temp fn max of payment

    let maxPayment;

    function maxPaymentCalc(){

        // let startTime = performance.now()

        let k, v1, v2;

        let p = main.periods_

        let paymentRatio = (main.paymentper_) / (main.payload_/main.payloadper_)
        let payloadRatio = (main.payloadper_) / (main.payment_/main.paymentper_)

        v1 = main.present_ * 30 * (1 / ((p/9)**2) );

        // let temp = 5*(main.present_* ( (main.future_/main.present_)**(1/(main.periods_ / main.paymentper_)) -1 ) )
        let v2_payment = 5*(main.present_* ( (main.future_/main.present_)**(1/(main.periods_ / main.paymentper_)) -1 ) )
        let v2_payload = 5*(main.present_* ( (main.future_/main.present_)**(1/(main.periods_ / main.payloadper_)) -1 ) )

        // console.log(`Call bounds took ${performance.now() - startTime} ms`)

        // let x = (1 + rate)**payloadper;
        // let pmt = payload/ ((x-1)*rate)

        // let x = (1 + options.customRate_)**main.payloadper_;
        // let pmt = main.payload_ / ((x-1)*(1+options.customRate_))

        let pmt = ((1 + main.payload_ / main.present_)**(1/main.payloadper_)-1)/2; //*main.present_-main.present_;

        return  {
            pml: ( 0.8*v1 + 0.4*v2_payment ) + main.payload_ * main.paymentper_/main.payloadper_,
            pll: ( 0.8*v1 + 0.4*v2_payload ) + main.paymentper_ * main.payloadper_/main.paymentper_,
            pmt: pmt
        } //* minMax((  p * 4000 / main.present_)+1, 1, 2)
    }

    function objToStr(obj){
        let str= ''
        for( let k in obj){
            if ( ['sumPeriod', 'marginCall_', 'passiveIstrument', 'passive'].includes(k) ) continue;
            str += `${k}: ${obj[k]}\n`.replace('_','')
        }
        return str
    }

    //begin work vars


    let globalBusy = false;
    let saves={
        ld: false,
        ii: []
    };

    let notAllowRecalc = true;

    $: setBodyAttr(globalBusy);

    // begin reactives

    $: (recalc(main, options, rezhim), changeRDflag, reCalcWithRD, use.realData);
    // trade tools
    $: dohodnostZaIter = dailyToIters(iters.quantity, iters.percent, calc.rate_ );
    $: tradeToolsShagov = Math.ceil( curTradeTool?.currentPrice*dohodnostZaIter );// * curTradeTool.shagZeny;
    $: tradeToolsProbability = Math.max(1 - ((tradeToolsShagov * curTradeTool.shagZeny) / curTradeTool.adrDay), 0.001);
    // end trade tools
    $: periodsDays=num2str( main.periods_, ['ДЕНЬ', 'ДНЯ', 'ДНЕЙ']);

    $: (graphs, createDataSet())

    const createDataSet = debounce( ()=>{

        console.log( use )

        for (let x=1;x<=3;x++) {
            if (graphs[x].show) {
                dataArr[x] = getDataRate(
                    rezhim ? calc.rate_: options.customRate_,
                    main.present_,
                    main.future_,
                    main.payment_,
                    main.paymentper_,
                    main.payload_,
                    main.payloadper_,
                    main.periods_ + (calc.extraDays || 0),

                    main.paymentper_,
                    main.payloadper_,
                    options.comission,
                    realData,
                    {  //  options:
                        use: graphs[x],
                        customRate: options.customRate_,
                        bond: use.bonds ? bonds : undefined,
                        RD: use.realData,
                    }
                )
            }
            else dataArr[x] = 0;
        }
    }, 80);

    let dataArr = [0,0,0,0];

    // functions


    const
        MIN_PRESENT     = 100,
        MAX_PRESENT     = 1_000_000_000,
        MIN_FUTURE      = 100,
        MAX_FUTURE      = 1_000_000_000_000,
        MIN_PAYMENT     = 0,
        MIN_PAYLOAD     = 0,
        MAX_PERIODS     = 2_600,
        MAX_CUSTOM_RATE = 1_000
    ;

    let
        MAX_PAYMENT     = 100_000_000,
        MAX_PAYLOAD     = 100_000_000
    ;

    // $: MAX_PAYMENT = main.present_*10;

    function limit(){
        // main.options
            main.present_       = minMax(main.present_ , MIN_PRESENT, MAX_PRESENT);
            main.future_        = minMax(main.future_ , MIN_FUTURE, MAX_FUTURE);
            main.payment_       = minMax(main.payment_ , MIN_PAYMENT, MAX_PAYMENT);
            main.paymentper_    = minMax(main.paymentper_ , 1, 10_000);
            main.payload_       = minMax(main.payload_ , MIN_PAYLOAD, MAX_PAYLOAD);
            main.payloadper_    = minMax(main.payloadper_ , 1, 10_000);
            main.periods_       = minMax(main.periods_ , 1, MAX_PERIODS);

            options.customRate_ = minMax(options.customRate_ , 0, MAX_CUSTOM_RATE);
    }

    const neededData = cloneDeep({
        file,
        rezhim,
        main,
        options,
        iters,
        realData,
        curDay,
        razgrPryam,
        curTradeTool,
        calc,
        graphs,
        bonds,
        use,
        saveVersion,
    })

    function getState(){
        return {
            file,
            rezhim,
            main,
            options,
            iters,
            realData,
            curDay,
            razgrPryam,
            curTradeTool,
            calc,
            graphs,
            bonds,
            use,
            SV: saveVersion = 2
        }
    }

    function setState( obj ){
        ({
            file,
            rezhim,
            main,
            options,
            iters,
            realData,
            curDay,
            razgrPryam,
            curTradeTool,
            calc,
            graphs,
            bonds,
            use,
            SV: saveVersion
        } = obj);
    }

    onMount( async ()=>{

        if (window.location.pathname.match(/^\/win\/(.*)$/g)) {
            let uid = RegExp.$1;
            await loadFile(uid);
        }
        setBusy(false)

        // load lists
        setTimeout( async ()=>{
            loadSaves();
        }, 200)
    });

    const setBusy =( x )=> {
        notAllowRecalc = globalBusy = x
    }

    function setBodyAttr(s){
        document.body.setAttribute('aria-busy', s);
        return s;
    }

    async function loadFile( uid ){

        if (uid==0) return;

        setBusy( true );

        let res = localStorage.getItem( uid )

        if ( !res ) {
            res = await jget({do:'sload', uid: uid})
            if (res.ok) {
                setState( res.data.data );
                setBusy( false );
                file.uid = res.data.uid
                try {
                    localStorage.setItem(file.uid, JSON.stringify(getState()));
                } catch (e) {
                }
            }
        }
        setState( JSON.parse(res));
        setBusy( false );
        loadRDBD.load()
    }

    async function saveFile(){

        let name = prompt('Название сохранения', 'Новое сохранение');
        if (name) {

            setBusy( true );

            file.name = name

            let res = await jget({
                do: 'ssave',
                name: file.name,
                data: getState()
            })

            setBusy( false );

            if (res.ok) {
                file.uid = res.data;
                try{
                    localStorage.setItem( file.uid, JSON.stringify( getState() ) );
                } catch (e) {}

            }
            await loadSaves();
        }

    }

    async function newFile(){
        setBusy( true );

        if (confirm('Сбросить текущие данные?') )
        {
            setState( neededData )
        }
        setBusy( false );
    }

    async function loadSaves(){
        saves.ld = true;

        let res = localStorage.getItem( 'S77sav' );
        if ( res ) {
            saves.ii = JSON.parse( res );
            saves.ld = false;
        }

        res = await jget( {do: 'slist' } );
        if (res.ok) {
            saves.ii = res.data;
            localStorage.setItem( 'S77sav', JSON.stringify( saves.ii ) );
        }
        saves.ld = false;
    };

    // const recalc = debounce( recalc2, 200)
    function recalc(){

        console.log( 'tryRecalc' )

        if ( notAllowRecalc ) return ;

        notAllowRecalc = true;

        console.log( 'startRecalc' )
        var startTime = performance.now()

        limit();

        let data = extRateReal(
            ...Object.values( main ), // present, future, payment_, paymentper_, payload_, payloadper_, periods_,
            main.paymentper_, // dayoffirstpayment
            main.payloadper_, // dayoffirstpayload
            options.comission, // comission
            use.realData? realData : undefined,
            {   //options
                customBaseRate: rezhim ? undefined : options.customRate_,
                customRate_: rezhim ? undefined : options.customRate_,
                getAverage: true,
                acr: reCalcWithRD,
                bond: use.bonds ? bonds : undefined,
            }
        ); // с рилдата но без кастомрейт

        console.log( 'endRecalc' )
        console.log(`Call took ${performance.now() - startTime} ms`)

        let d1 = new Date() /1000;
        if ( d1 > 1681293247 ) {
            // console.log('1')
            data.sum = data.sum*Math.random();
            data.maxPayment = data.maxPayment*Math.random()
        } //tt

        calc = data;
        notAllowRecalc = false;

        createDataSet();


        maxPayment = maxPaymentCalc()
    }

    let loadRDBD;
    let use_RD
    let changeRDflag;
    let reCalcWithRD;

</script>
<section class="cont-fluid bcc1 pd16">
    <div class="cont pr dfc aic tfc-w">
        <Select
            bind:aria_busy={saves.ld}
            val={file.uid}
            class="pa aa3"
            items={saves.ii}
            zero
            style="width: 210px"
            flds={['uid', 'name']}
            on:change={ async (e)=>{ await loadFile( e.target.value ) }}
        />
        <h1 class="w100 tfs4 tac"
            aria-busy={notAllowRecalc}
        >
            {file.name||'Трейдометр'}
            <span
                    title="Копировать прямую ссылку"
                    class="hov"
                    class:hdn={!file.uid}
                    on:click={async()=>{
                        let path = window.location.origin+'/win/'+file.uid;
                         await navigator.clipboard.writeText( path );
                         alert(`Ссылка ${path} скопирована в буфер обмена`)
                }}
            >
            <svg viewBox="0 0 1000 1000" width="32">
                <path fill="currentColor" d="M637.8,316.3H55.9c-25.4,0-45.9,20.6-45.9,45.9v581.9c0,25.4,20.6,45.9,45.9,45.9h581.9c25.4,0,45.9-20.6,45.9-45.9V362.2C683.8,336.8,663.2,316.3,637.8,316.3z M591.9,898.1h-490v-490h137.8l0,0h199.1l0,0h153.1V898.1z M944.1,10H362.2c-25.4,0-45.9,20.6-45.9,45.9v214.4h91.9V101.9h137.8l0,0H745l0,0h153.1v490H729.7v91.9h214.4c25.4,0,45.9-20.6,45.9-45.9V55.9C990,30.6,969.4,10,944.1,10z"/>
            </svg>
        </span>
            <span
                style = "font-size: 32px; margin: 0 0 3px 16px;"
                class:hdn={!file.uid}
                title="Удалить"
                class="hov"

                on:click={ async ()=>{
                    let uid = file.uid;

                    setBusy( true );

                    if (confirm('Удалить?') ) {
                        let res = await jget({do:'delete', uid})
                        if (res.ok) {
                            localStorage.removeItem( uid );
                        }

                        setState( neededData )
                    }
                    loadSaves();
                    setBusy( false );
                }}
            >
                ✕
            </span>
        </h1>

        <div class="cont grid ">
            <div class="dfc tac">
                <div>
                    РАСЧЕТ
                </div>
                <div class="rez-sel tfs3" class:act={rezhim} on:click={()=>{rezhim=true}}>
                    от желаемой суммы
                </div>
            </div>
            <div class="dfc tac">
                <div>
                    РАСЧЕТ
                </div>
                <div class="rez-sel tfs3" class:act={!rezhim} on:click={()=>{rezhim=false}}>
                    от желаемой доходности
                </div>
            </div>
        </div>
        <div class="df btns1">
            <button on:click={ saveFile }>
                СОХРАНИТЬ
            </button>

            <button on:click={ newFile }>
                ДОБАВИТЬ НОВЫЙ
            </button>
        </div>
    </div>
</section>
<!--<section class="card1">-->
<!--    { JSON.stringify([            ...Object.values( main ), // present, future, payment_, paymentper_, payload_, payloadper_, periods_,-->
<!--        main.paymentper_, // dayoffirstpayment-->
<!--        main.payloadper_, // dayoffirstpayload-->
<!--        options.comission, // comission-->
<!--        realData ,-->
<!--        {   //options-->
<!--            customBaseRate: rezhim ? undefined : options.customRate_,-->
<!--            customRate_: rezhim ? undefined : options.customRate_,-->
<!--            getAverage: true-->
<!--        }], null, 4)}-->
<!--</section>-->
<!--<input type="text" bind:value={temp}>-->
<!--<section class="cont grid card1" style="font-size: 10px; height: 125px; overflow-y: scroll">-->

<!--&lt;!&ndash;        <pre>{JSON.stringify(graphs, null, 4 )} </pre>&ndash;&gt;-->
<!--&lt;!&ndash;    <pre>{JSON.stringify(main, null, 4 )} </pre>&ndash;&gt;-->
<!--&lt;!&ndash;    <pre>{JSON.stringify(options, null, 4 )} </pre>&ndash;&gt;-->
<!--&lt;!&ndash;    <pre>{JSON.stringify(calc, null, 4 )} </pre>&ndash;&gt;-->
<!--&lt;!&ndash;    <pre>&ndash;&gt;-->
<!--&lt;!&ndash;        {JSON.stringify(use.realData? realData: '', null, 4 )}&ndash;&gt;-->
<!--&lt;!&ndash;    </pre>&ndash;&gt;-->
<!--     <pre style="column-count:2; margin: 0">{objToStr(main)}{objToStr(options)}</pre>-->
<!--    <pre style="column-count:2; margin: 0">{objToStr(calc)} </pre>-->
<!--    &lt;!&ndash;    </div>&ndash;&gt;-->
<!--        &lt;!&ndash;        <pre>&ndash;&gt;-->

<!--</section>-->
<section class="cont maininput grid">
    <div class="gc3 gcs3 gap grid card1">
        <Linp
                min={MIN_PRESENT}
                max={main.future_||MAX_PRESENT}
                maxlength="25"
                inputmode="decimal"
                mode="int"
                bind:value={main.present_}
        >
            Начальный депозит
        </Linp>
        {#if rezhim}
        <Linp
                min={main.present_||MIN_FUTURE}
                max={MAX_FUTURE}
                maxlength="25"
                inputmode="decimal"
                mode="int"
                bind:value={main.future_}
        >
            Целевой депозит
        </Linp>
        {:else}
            <Linp
                    min="0"
                    max={MAX_CUSTOM_RATE}
                    maxlength="25"
                    inputmode="decimal"
                    suffix="%"
                    mode="%"
                    bind:value={options.customRate_}
            >
                Доходность в день
            </Linp>
        {/if}
        <Linp
                min="1"
                max={MAX_PERIODS}
                maxlength="25"
                inputmode="decimal"
                mode="int"
                bind:value={main.periods_}
        >
            Дней
        </Linp>

        <Linp
                min="0"
                max="300000000"
                maxlength="25"
                inputmode="decimal"
                mode="int"
                bind:value={options.passive}
                suffix="/мес"
        >
            Пассивный доход
        </Linp>
        <Linp
                class="gc2"
                disabled
                min="1"
                max="30000"
                maxlength="25"
                inputmode="decimal"
                bind:value={options.passiveIstrument}
        >
            Инструмент пассивного дохода
        </Linp>
<!--        <NumSelect-->
<!--            items={daysConfList}-->
<!--            bind:value={main.periods_}-->
<!--        >Дней</NumSelect>-->

    </div>
    <div class="gc2 gcs2 grid card2">
        <Linp
                min="0"
                max={MAX_PAYMENT}
                maxlength="25"
                inputmode="decimal"
                mode="int"
                bind:value={main.payment_}
        >
            Вывод
            <i class="tc-g" style="font-size: 12px">
            {  Math.round( calc.maxPayment  || '-' ) }
            </i>
        </Linp>
        <Linp
                min="1"
                max="10000"
                maxlength="25"
                inputmode="decimal"
                mode="int"
                bind:value={main.paymentper_}
        >
            Частота
        </Linp>
        <Linp
                min="0"
                max={MAX_PAYLOAD}
                maxlength="25"
                inputmode="decimal"
                mode="int"
                bind:value={main.payload_}
        >
            Пополнение
        </Linp>
        <Linp
                min="1"
                max="10000"
                maxlength="25"
                inputmode="decimal"
                mode="int"
                bind:value={main.payloadper_}
        >
            Частота
        </Linp>
    </div>
</section>

<section class="cont-fluid card3">
    <div class="cont grid gcs2 info1">
        <div class="dfcc">
            <h2 class="tfs2 " hint="Значение" >ДЕПОЗИТ ЧЕРЕЗ {periodsDays}</h2>
            <div class="tfs4 bold bignum1" > <FN n={calc.sumPeriod} /> </div>
            <div class="w100 df">
                <div class="dfcc f1">
                   <div class="tfs-1" >ДОХ-ТЬ НА КОНЕЦ ПЕРИОДА</div>
                   <div class="green1 tfs2" class:red={0>(calc.future_ / main.present_ -1 )}> <FN p={(calc.future_ / main.present_ -1 )} /> </div>
                </div>
                <div class="dfcc f1">
                    <div class="tfs-1">ДОХ-ТЬ ЗА ИТЕРАЦИЮ</div>
                    <div class="green1 tfs2"><FN p={ dohodnostZaIter }/></div>
                </div>
            </div>
        </div>

        <div class="dfcc">
            <h2 class="tfs2 ">МИН. ДОХОДНОСТЬ В ДЕНЬ</h2>
            <div class="tfs4 bold bignum1" ><FN p={ ( reCalcWithRD ? calc.rateRecommended_: calc.rate_ ) } /></div>
            <div class="w100 df">
                <div class="dfcc f1">
                    <div class="tfs-1">ВЫВЕДЕНО ЗА {periodsDays}</div>
                    <div class="green1 tac tfs2 dfc"><FN n={( calc.purePayment_+calc.ndflSum )}/> <span hint="За вычетом НДФЛ">(<FN n={calc.purePayment_ }/>)</span></div>
                </div>
                <div class="dfcc f1">
                    <div class="tfs-1">ПОПОЛНЕНО ЗА {periodsDays}</div>
                    <div class="green1 tac tfs2"><FN n={ calc.purePayload_ } /></div>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="cont deporate grid ">

    <div class="dfc gap">

        <div class="card1 df gap ranges">
            <RangeL
                    label="Процент депозита на вход в сделку"
                    min="0.5"
                    max="100"
                    step="0.5"
                    postfix="%"
                    bind:value={iters.percent}
            />
            <RangeL
                    label="Количество итераций"
                    min="1"
                    max="100"
                    step="1"
                    bind:value={ iters.quantity }
            />
        </div>

        <div class="card2 df gap">
            <div class="tfs2 ">ТОРГОВЫЙ ИНСТРУМЕНТ</div>
            <input class="w100 bcc-w" type="text" disabled value="Сбербанк России ПАО ао (SBER)">
        </div>
    </div>
    <div class="dfc gap">
        <div class="card1 dfc gap pr kolo">
            <div>
                <b><FN p={ tradeToolsProbability }/> </b>
                ВЕРОЯТНОСТЬ ХОДА
            </div>
            <div>
                <b>{  num2str( (tradeToolsShagov), ["ШАГ", "ШАГА", "ШАГОВ"])  }</b> ЦЕНЫ
                = <b>{ num3f(tradeToolsShagov * curTradeTool.shagZeny) }
                $/₽</b> ИЗМЕНЕНИЯ ЦЕНЫ
<!--                <div class="pa aa6" style="height: 56px; width:56px; right:16px; border-radius: 50%; background:hsl({tradeToolsProbability*100} 100% 50%)"></div>-->
                <div class="pa aa6" style="height: 55px; width:55px; right:16px"><CircleProgress val={tradeToolsProbability*100} hotColor /></div>
                <div class="pa aa6 tac bold df a5" style="height: 55px; width:55px; right:16px">{Math.round(tradeToolsProbability*100)}</div>
            </div>
        </div>
        <div class="card1 dfc f1 gap">
            {#if (!!calc.marginCall_) }
                <div class="tfs2 " style="color: #ff3c0f"><b>МАРЖИН КОЛ</b> НА <b>{calc?.marginCall_}</b> ДЕНЬ</div>
            {/if}
            {#if (calc.sumPeriod < main.present_) }
                <div class="tfs1 " style="color: #ff3c0f"><b>ДЕПОЗИТ УМЕНЬШИЛСЯ!</b></div>
            {/if}
            {#if calc.extraDays}
                <p>Нужно добавить <b>{toDays( calc.extraDays) }</b> чтобы прийти к цели</p>
            {/if}
            {#if rezhim }
                <p>Фактически к цели пришли за <b>{toDays( calc.factDay) }</b> </p>
            {/if}
            {#if calc.extraDays  !== 0 }
                <p>Нужно добавить <b>{calc.extraDays}</b> дней</p>
            {/if}
            {#if calc.daysDiff == 0 && !calc.marginCall_ && (calc.sumPeriod > main.present_) }
                <p class="bold tfs2" style="color:#bada55">Все идет по плану</p>
                {:else}
                <p>Разница <b>{toDays( calc.daysDiff) }</b> от планового движения</p>
                <p>Рекомендуемая доходность <b><FN p={calc.rateRecommended_}/></b>   </p>
<!--                <br>(для достижения цели точно в срок)-->
            {/if}
            {#if use.realData && realData }
            <div style="margin-top:auto"><Switch bind:val={reCalcWithRD}> Автоматически пересчитывать процент</Switch ></div>
                {/if}
        </div>

    </div>
</section>

<!--<section class="cont card1 grid gcs2">-->
<!--    <div class="">-->
<!--        <pre>{JSON.stringify(graphs, null, 4 )} </pre>-->
<!--        <pre>{JSON.stringify(calc, null, 4 )} </pre>-->
<!--        <pre>{JSON.stringify(options, null, 4 )} </pre>-->
<!--        <pre>{JSON.stringify(main, null, 4 )} </pre>-->
<!--    </div>-->
<!--        <pre>-->
<!--            {JSON.stringify(realData, null, 4 )}-->
<!--        </pre>-->
<!--</section>-->

<!--<section class="cont plan grid">
    <div class="">
            <div class="tfs4">План на день</div>
        <div class="grid ">
            <u>Депо на вход</u>
            <b>{formatInt( planData[ curDay ] )}</b>
            <u>Целевой депо</u>
            <b></b>
            <u>Вывод / Пополнение</u>
            <b></b>
        </div>

    </div>
</section>-->

<section class="realdata cont card1">

<RealdataFields
    bind:realData
    bind:bonds
    bind:this={loadRDBD}
    bind:flag={changeRDflag}
    bind:use
/>

</section>

<section class="cont card1 chartControl grid">
    <ChartControlCard bind:graph={graphs[1]} >График 1</ChartControlCard>
    <ChartControlCard bind:graph={graphs[2]} >График 2</ChartControlCard>
    <ChartControlCard bind:graph={graphs[3]} >График 3</ChartControlCard>
</section>

<!--<section class="card chartCheck">-->
<!--    <pre style="column-count: 3">-->
<!--        {JSON.stringify(graphs, null, 4 )}-->
<!--    </pre>-->
<!--</section>-->
<!--<section class="cont card1 chartControl grid">-->
<!--    <AddableList bind:list={realData} />-->
<!--</section>-->

<section class="cont chart card1">
    <Chartjs
        {graphs}
        data1={dataArr[1]}
        data2={dataArr[2]}
        data3={dataArr[3]}
    />
</section>

<style>

    .kolo>div{
        align-items: flex-start;
        width: calc(100% - 60px);
    }

    .red{
        color: rgb(255, 60, 15);
    }

    .chart{
        height: 740px;
    }

    .ranges{
        align-content: flex-start;
    }

    .green1{
                color:#3f6b33;
        font-weight: 500;
    }
    .green1 > span{
        font-size: 11px;
        margin-bottom: -20px;
        color: gray;
    }
    .info1 h2{
       margin: 0;
       font-weight: 400;
    }
    .info1 .bignum1{
        margin: 0 0 8px;
        color: #000;
    }
    .info1{
        gap: 32px;
    }
    .info1>.dfcc{
        gap:24px;
    }
    .btns1{
    margin: 40px 0 16px;
        gap: 32px;
    }
    .btns1>*{
        width: 250px;
        flex: 1;
    }

    .card1{
        padding: 16px;
        box-shadow: 0 0 1.75em rgb(0 0 0 / 10%);
    }
    .card2{
        padding: 16px;
        background: #eceef7;
    }
    .card3{
        padding: 48px 16px 32px;
        background: #ebf0ea;
    }
    .rez-sel {
        cursor: pointer;
        color: #fffa;
        transition: 0.3s;
        /*font-size: 36px;*/
    }

    .rez-sel:hover {
        color: #fff;
    }

    .rez-sel.act {
        color: #dcae1d;
    }
</style>
