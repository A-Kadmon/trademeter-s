<script>

    export let value = 0, suffix='', mode='', max, min;
    let classList = '';
    export { classList as class };

    let timer, timeOut=4000;

    if (isNaN(max)) max=undefined;
    if (isNaN(min)) min=undefined;

    $: display = format( value );

    function toVal(){
        let str=display, t;
        if(mode==='int') {
            t = parseInt( str?.replace(/[^0-9]/g, '') );
            if( !isNaN(t) ) value=t;
        }
        else if(mode==='%') {
            t = parseFloat( str.replace(/[^0-9,.]/g, '').replace(',', '.') )/100;
            if( !isNaN(t) ) value=t;
        } else value = str
        if (display ==='') {
            timeOut=2300;
            clearTimeout(timer);
            timer = setTimeout( minMax, timeOut);
            // display = format(value)
             value = 0;

        }
    }

    function format( num ){

        clearTimeout(timer);

        if(mode==='int' ) {
            timer = setTimeout( minMax, timeOut);
            return isNaN(num)?num: num.toLocaleString(undefined, {maximumFractionDigits:16});
        }
        if( mode==='%') {
            // check min max
            timer = setTimeout( minMax, timeOut);
            return isNaN(num)?num: (num*100).toLocaleString(undefined, {maximumFractionDigits:16});
        } else return num

    }

    function test(e){
        if ( mode==='%' || mode==='int') {
            display = display.replace(/[^0-9\s.,]/g, '');
            toVal()
        }
    }

    function minMax(){
        timeOut = 1200
        if(display =='') value = min
        value = Math.max( value, min )
        value = Math.min( value, max )
    }


</script>
<label class="pr dfc gap {classList}">
    <slot></slot>
    <input
            {...$$restProps}
            bind:value={ display }
            on:input={ test }
            on:change={ toVal }
            on:blur={minMax}
    >
    <div class="pa ivs1">{suffix}</div>
</label>

<style>

    /*input::-webkit-outer-spin-button,*/
    /*input::-webkit-inner-spin-button {*/
    /*    -webkit-appearance: none;*/
    /*    margin: 0;*/
    /*}*/
    /*input[type=number] {*/
    /*    -moz-appearance: textfield;*/
    /*}*/
</style>
