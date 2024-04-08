<script>

    import {onMount} from "svelte";
    import {debounce, minMax} from "../helpers";

    export let value = 0, suffix='', mode='', max, min;

    let classList = '';
    export { classList as class };

    let ref;

    if (isNaN(max)) max=undefined;
    if (isNaN(min)) min=undefined;

    let oldValue = value
    let display, innerFlag
    let oldDisplay = display = format(value);


    $: (min, max, ref && normalize() )

    $: onChangeValue( value )

    // const formatOnFly = debounce( normalize, 2400)

    const setValue = val=> {
        if (val == oldValue ) return;
        innerFlag = true,
        value = val
        oldValue = value
    }

    const onChangeValue = val=> {
        if( !innerFlag ) display = format(value)
        innerFlag = false
        oldValue = value
    }

    const getValue = val=> {
        if (val == oldValue ) return;
        innerFlag = true,
            value = val
        oldValue = value
    }

    function format( num ){

        // console.log('format -- m m ', min, max)

        if(mode==='int' ) {
            return isNaN(num)?num: num.toLocaleString(undefined, {maximumFractionDigits:0});
        }
        if( mode==='%') {
            return isNaN(num)?num: (num*100).toLocaleString(undefined, {maximumFractionDigits:14});
        } else return num

    }

    function test_symbols( str){
        return (/^[0-9\s.,]+$/.test( str ) )|| str=='';
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
            // formatOnFly()
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

        //console.log( 'normalize' )
        let t = test_correct( ref.value );

        if ( t===null ) value=min
        else value = t;
        if(mode==='int' || mode==='%') setValue( minMax( value, min, max ) ); // !!!!!!

        display = format(value)
        err=false
    }

    let err;



</script>
<label class="pr dfc gap {classList}">
    <div><slot></slot></div>
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
