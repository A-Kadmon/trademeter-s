<script>
    import Svelecte from 'svelecte';
    import {onMount} from "svelte";

    export let
        value,
        items,
        min=1,
        max=2600;

    let oldValue = value;

    $: list = toListOfObjects(items);

    function toListOfObjects(data, fields = ['id', 'name']) {
        if (Array.isArray(data)) {
            if (Array.isArray(data[0]) && data[0].length > 1) {
                return data.map( e=>( { [e[0]]: e[1] } ) );
            }
            else if (typeof data[0] === 'object' && data[0] !== null) {
                let keys = Object.keys(data[0]);
                let a = keys.includes(fields[0]) ? fields[0] : keys[0];
                let b = keys.includes(fields[1]) ? fields[1] : keys[1];

                return data.map( (obj) => ( { [obj[a]]: obj[b]} ) );
            }
            else {
                return data.map((value, index) => ({[index]: value}));
            }
        }
        else if (typeof data === 'object' && data !== null) {
            return Object.entries(data).map((e) => ( { [fields[0]]:e[0], [fields[1]]: e[1] } ));
        }
        else {
            return [];
        }
    }

    function createFilter(inputValue){
        let res=parseInt(inputValue);
        if ( isNaN(res) ) return '';
        if(res>max) return max;
        if(res<min) return min;
        else return res;
    }

    onMount( _=>{
        value=oldValue
    })

</script>

<label class="dfc gap">
    <slot></slot>
    <Svelecte
            options={list}
            bind:value
            creatable="true"
            allowEditing="true"
            closeAfterSelect="true"
            placeholder={oldValue}
            creatablePrefix=""
            createFilter={createFilter}
            {...$$restProps}
            on:change={()=>{console.log(1)}}
            name ='hhh111'
    ></Svelecte>
</label>
