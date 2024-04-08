<script>
    export let
        items,
        val,
        flds=['id', 'name'],
        zero,
        aria_busy = false
    ;

/*    let val;

    $: value=(mode=='id') ? val[0] : ( mode=='entre') ? val : val[1];

    $: data = toEntries(items);
*/

    function toEntries(data, fields = ['id', 'text'], mode = 0) {
        if (Array.isArray(data)) {
            if (Array.isArray(data[0]) && data[0].length > 1) {
                return data;
            }
            else if (typeof data[0] === 'object' && data[0] !== null) {
                let keys = Object.keys(data[0]);
                let a = keys.includes(fields[0]) ? fields[0] : keys[0];
                let b = keys.includes(fields[1]) ? fields[1] : keys[1];

                return data.map((obj) => [obj[a], obj[b]]);
            }
            else {
                return data.map((value, index) => [index, value]);
            }
        }
        else if (typeof data === 'object' && data !== null) {
            if ( mode===0) return Object.entries(data);
            else return Object.entries(data).map((e) => ( { [fields[0]]:e[0], [fields[1]]: e[1] } ));
        }
        else {
            return [];
        }
    }


</script>

<label class="dfc gap" {...$$restProps} aria-busy={aria_busy} >
    <slot></slot>
    <select bind:value={val} on:change placeholder="Не выбрано">
        {#if zero}
            <option value={0} disabled selected>
                {(zero === true) ? 'Не выбрано' : zero}
            </option>
        {/if}
        {#each items as item, i}
            <option value={item[flds[0]]}>
                {item[flds[1]]}
            </option>
        {/each}
    </select>
</label>
