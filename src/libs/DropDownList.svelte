<script>
    export let items, val;

    function itemClick(e){
        e.target.classList.add('act')
    }
</script>

<svg width="13" height="8"><path d="M11.3 1L6.5 5.7 1.7 1l-.7.7L6.5 7 12 1.7l-.7-.7z"/></svg>

<div class="df a5">
    <input readonly  />
<!--shevron-->

    <div class="pa">
    {#each items as item, i}
        <i>item[1]</i>
    {/each}
    </div>
</div>
