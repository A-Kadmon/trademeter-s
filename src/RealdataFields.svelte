<script>
    import Switch from "./libs/Switch.svelte";
    import {debounce} from "./helpers";

    export let realData, bonds, flag, use

    let errRD=false, errBd=false,  realDataOut, bondsOut;

    let realDataIn = JSON.stringify( realData, null, 4 );
    let bondsIn = JSON.stringify( bonds, null, 4 );

    let RDon=true, BDon=false, RD1=false, BD1=false

    $: use.realData = RDon;
    $: use.bonds = BDon;

    $: (realDataIn, RD_norm, convertRD())
    $: (bondsIn, BD_norm, convertBD())

    $: (RD1, RD_PLUS())
    // $: (BD1, BD_PLUS())

    let BD_norm;

    export const load = ()=>{
        setTimeout( ()=>{
        realDataIn = JSON.stringify( realData, null, 4 );
        bondsIn = JSON.stringify( bonds, null, 4 );
    }, 120)
    }

    const reWriteRealDataIn = debounce(_=>{
        realDataIn = JSON.stringify( realDataOut )
    }, 250)

    function convertRD(){
        try {
            errRD=false
            errMsgRD=''

            flag=!flag

            if(!RDon) {
                realData = undefined
                return
            };

            if ( !realDataIn ) {
                realData=undefined
            }
            else {
                let rr
                if (RD_norm)  rr = normalizeJson( realDataIn )
                else  rr = realDataIn
                realDataOut = JSON.parse( rr );
                realDataOut.time = new Date();
                // reWriteRealDataIn();

                // alert (typeof realDataOut)
                let tt = 1
                for (let t of Object.keys( realDataOut ) ){
                    realDataOut[t].day = tt;
                    tt++
                }

                realData = realDataOut

            }

        } catch(e ) {
            errRD=true
            errMsgRD = e
        }
    }

    function convertBD(){
        try {
            errBd=false
            errMsgBD=''

            if(!BDon) {
                bonds = undefined
                return
            };

            if ( !bondsIn ) {
                bonds=undefined
            }
            else {
                let rr
                if (BD_norm)  rr = normalizeJson( bondsIn )
                else  rr = bondsIn
                bondsOut = JSON.parse( rr );
                bonds = bondsOut
            }

        } catch(e ) {
            errBd=true
            errMsgBD = e
        }
    }

    const updatePlusOne = (obj, adder=1)=> Object.keys(obj).reduce((acc, key) => {
        if (!isNaN(key)) { // check if key is numeric
            const newKey = parseInt(key) + adder; // increment the key by 1
            acc[newKey] = obj[key];
        } else {
            acc[key] = obj[key]; // leave non-numeric keys unchanged
        }
        return acc;
    }, { 'time': new Date()} );

    function RD_PLUS(){
        try {
            if ( realDataOut && Object.keys(realDataOut).length>0 ) {
                if (RD1) realDataIn = JSON.stringify(updatePlusOne(realDataOut, 1), null, 4)
                else realDataIn = JSON.stringify(updatePlusOne(realDataOut, -1), null, 4)

            }
        } catch (e) {

        }
    }

    function BD_PLUS(){
        try {
            if ( bondsOut && Object.keys(bondsOut).length>0 ) {
                if (BD1) bondsIn = JSON.stringify(updatePlusOne(bondsOut, 1), null, 4)
                else bondsIn = JSON.stringify(updatePlusOne(bondsOut, -1), null, 4)

            }
        } catch (e) {

        }
    }

   function normalizeJson(str){
        return str.replace(/[\s\n\r\t]/gs, '').replace(/,([}\]])/gs, '$1')
            .replace(/([,{\[]|)(?:("|'|)([\w_\- ]+)\2:|)("|'|)(.*?)\4([,}\]])/gs, (str, start, q1, index, q2, item, end) => {
                item = item.replace(/"/gsi, '').trim();
                if(index){index = '"'+index.replace(/"/gsi, '').trim()+'"';}
                if(!item.match(/^[0-9]+(\.[0-9]+|)$/) && !['true','false'].includes(item)){item = '"'+item+'"';}
                if(index){return start+index+':'+item+end;}
                return start+item+end;
            });
    }

    let errMsgRD;
    let errMsgBD;
    let RD_norm;

</script>

<div class=" grid gcs2">
<div>
    <div class="tfs3 mrv16 mrt0 df a4 gap">
        История
        <span style="margin-left: auto" class="pr sw">
            <Switch bind:val={RDon} />исп</span>
        <span class="pr sw"><Switch bind:val={RD_norm}/>hc</span>
        <span class="pr sw"><Switch bind:val={RD1}/>+1</span>
    </div>
    <textarea
                    rows="10"
                    class="w100"
                    bind:value={ realDataIn }
                    class:alert={errRD}
                    class:gray={!RDon}
            ></textarea>
</div>
    <div>
        <div class="tfs3 mrv16 mrt0 df a4 gap" >
            Облигации
            <span style="margin-left: auto" class="pr sw"><Switch bind:val={BDon}/>исп</span>
            <span class="pr sw"><Switch bind:val={BD_norm} />hc</span>
            <span class="pr sw"><Switch  bind:val={BD1}/>+1</span>
            </div>
        <textarea
                    rows="10"
                    class="w100"
                    bind:value={ bondsIn }
                    class:alert={errBd}
                    class:gray={!BDon}
            ></textarea>
    </div>
    <div class="errorbox">
        {errMsgRD||''}
    </div>
    <div class="errorbox" on:click={load}>
        {errMsgBD||''}
    </div>
<!--    <b>{ JSON.stringify( realDataIn, null, 8 )}</b>-->
<!--    <b>{ JSON.stringify( bondsIn, null, 8 )}</b>-->
<!--    <b>{ JSON.stringify( realDataOut, null, 8 )}</b>-->
<!--    <b>{ JSON.stringify( bondsOut, null, 8 )}</b>-->
    <!--    <pre contenteditable="true">-->
    <!--    </pre>-->
</div>

<style>
    .errorbox{
        height: 20px;
        font-size: 11px;
        overflow: hidden;
    }
    .sw{
        top: 4px;
        font-size: 18px;
        display: flex;
        flex-direction: row-reverse;
        gap: 8px;
        margin-left: 8px;
    }

    .sw>:global(div){

    }
    .alert{
        box-shadow: red 0px 0px 4px 3px;
    }
    .gray{
        color: #bbb;
        background: #e7e7e7;
    }
    textarea{
    }
</style>
