<script>

    export let val, hotColor;
    let color='currentColor';
    $: l=566*(100-val||0)/100
    $: if(hotColor){
         color=`hsl(${val} 90% 65%)`;
    }

</script>

<svg viewBox="0 0 200 200" >
    <circle cy=100 cx=100 r=90 fill=transparent stroke="#ccc" stroke-width="18"></circle>
    <circle style="stroke-dashoffset:{l}; color:{color}"
            class="st"
            cy=100 cx=100 r=90 fill=transparent stroke="currentColor" stroke-width="20" stroke-dasharray="100, 500"
            stroke-dashoffset=0></circle>
</svg>

<style>
    .st{
        /*stroke-miterlimit: 5;*/
        transform-origin: 50%;
        transform: rotate(90deg);
        stroke-dasharray: 566;
        /*stroke-dashoffset: 0;*/
        transition: stroke-dashoffset .5s, stroke .5s;
    }
</style>
