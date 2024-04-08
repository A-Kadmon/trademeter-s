<script>

    import {onMount} from "svelte";
    import {debounce, minMax} from "../helpers";
    // import {debounce} from "../helpers";

    export let value = 0, suffix='', mode='', max, min;

    let classList = '';
    export { classList as class };

    let ref;

    if (isNaN(max)) max=undefined;
    if (isNaN(min)) min=undefined;

    let display, semaphore
    let oldDisplay = display = format(value);
    let oldValue = value

    // const formatOnFly = debounce( normalize, 2400)

    const setValue = val=> {
            if (val == oldValue ) return;
            semaphore = true,
            value = val
            oldValue = value
    }

    $: (min, max, value, ref && normalize() )

    function setFromOuter(){
        display = value;
        ref.value = value;
    }

    function format( num ){

        // console.log('format -- m m ', min, max)

        if(mode==='int' ) {
            return isNaN(num)?num: num.toLocaleString(undefined, {maximumFractionDigits:16});
        }
        if( mode==='%') {
            return isNaN(num)?num: (num*100).toLocaleString(undefined, {maximumFractionDigits:16});
        } else return num

    }

    function test_symbols( str){
        return /^[0-9\s.,]+$/.test( str );
    }

    function test_correct( str ){
        let t
        if(mode==='int') {
            // console.log( JSON.stringify([str, value]))
            t = parseInt( str?.replace(/[^0-9]/g, '') );
        }
        else if(mode==='%') {
            t = parseFloat( str.replace(/[^0-9,.]/g, '').replace(',', '.') )/100;
        } else
            return str

        return ( Number.isNaN(t) )
            ? null
            : t
    }

    function handleInput(e){
        let t

        const inputValue = e.target.value;
        if ( test_symbols(inputValue) ) {
            oldDisplay = inputValue;
            t = test_correct( inputValue )
            if ( t!==null && t<=max && t >= min) { //!!!!!!!
                setValue( t );
                err=false
            } else err=true
        } else {
            e.target.value = oldDisplay;
        }
    }

    function normalize(){

        // if( semaphore ){
        //     semaphore = false
        //     return
        // }
        // console.log( 'normalize', ref )
        let t = test_correct( ref.value );

        if ( t===null ) value=min
        else value = t;
        if(mode==='int' || mode==='%') setValue( minMax( value, min, max ) );

        ref.value = format(value)
        err=false
        // console.log('norm', min)
    }

    let err;



</script>
<label class="pr dfc gap {classList}">
    <slot></slot>
    <input
            {...$$restProps}
            class:err={err}
            value={ display }
            bind:this="{ref}"
            on:input={ handleInput }

            on:blur={ normalize }
    >
    <div class="pa ivs1">{suffix}</div>
</label>
<!--            on:change={ normalize }-->
<style>
    .err{
        box-shadow: 0 0 0 2px #f1839a;
    }
    /*input::-webkit-outer-spin-button,*/
    /*input::-webkit-inner-spin-button {*/
    /*    -webkit-appearance: none;*/
    /*    margin: 0;*/
    /*}*/
    /*input[type=number] {*/
    /*    -moz-appearance: textfield;*/
    /*}*/
</style>
