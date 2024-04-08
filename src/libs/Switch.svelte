<script>
    export let val
</script>
<div class="df gap" {...$$restProps}>
<label class:cactive={val}><input type="checkbox" bind:checked="{val}" /></label>
<slot></slot>
</div>
<style>
    input[type=checkbox]{
        height: 0;
        width: 0;
        visibility: hidden;
    }

    label {
        cursor: pointer;
        text-indent: -9999px;
        width: 41px;
        height: 23px;
        background: grey;
        display: block;
        border-radius: 23px;
        position: relative;

    }

    label:after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 19px;
        height: 19px;
        background: #fff;
        border-radius: 19px;
        transition: 0.23s;
    }

    label.cactive {
        background: #bada55;
                /*#4859b4;*/
                /*#0069d9;*/
        /*#bada55;*/
    }

    label.cactive:after {
        left: calc(100% - 2px);
        transform: translateX(-100%);
    }

    label:active:after {
        width: 25px;
    }
</style>
