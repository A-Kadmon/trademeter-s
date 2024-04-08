<script>
    import {num16f, num2f, num3f} from "../helpers";

    export let n, p, t

    $: (n, p, t, ch())

    const ch = ()=> {

        if (isNaN(n)) {
            if (isNaN(p)) t = n = ''
            else {
                t = num16f(p)
                n = p * 100
                n = n > 100000000000000000 ? '∞' : num2f(n) + '%';
            }
        } else {
            t = num16f(n)
            n = n > 100000000000000000 ? '∞' : num3f(n);
        }
    }
</script>
<i hint="{t}" {...$$restProps} on:dblclick={async e=>{
    if( e.ctrlKey||e.metaKey ) await navigator.clipboard.writeText( t );
}}>{n}</i>
