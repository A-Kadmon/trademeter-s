<script>
    export let list, type='obj'; //'array'

    let innerList;

    function changeHandle(){

    }

    function add(){
        innerList
        { }
    }

</script>

<div class="dfc">
    <div class="df bold fc1 al_title">
        <i>День</i><i>Scale</i><i>Payment</i><i>Payload</i><i></i>
        <i>Scale</i><i>Payment</i><i>Payload</i><i></i>
    </div>
    {#each Object.entries( list|| {} ) as [day, i], day }
       <div on:change={changeHandle} >
           <i># day</i>
           <i contenteditable="true" >{i.scale}       </i>
           <i contenteditable="true" >{i.payment}     </i>
           <i contenteditable="true" >{i.payload}     </i>
           <i class="remove_btn">
               <svg fill="none" stroke="#fff" stroke-width="12" stroke-dashoffset="0" stroke-dasharray="0" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" data-v-003f2257=""><line x1="15" y1="15" x2="85" y2="85"></line> <line x1="85" y1="15" x2="15" y2="85"></line></svg>
           </i>
       </div>
    {/each }
</div>

<style>
    .al_title i{
        padding: 8px;
    }
    .al_list{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 30px;
        gap: 0;
        justify-items: stretch;
    }

    .remove_btn{
        opacity: 1;
        background: #951246;
    }

    .button{
        background: #107292;
        border: 0;
        border-radius: 3px;
        color: #fff;
        cursor: pointer;
        line-height: 1;
        margin-bottom: 0.875em;
        padding: 0.375em;
        font-size: .875rem;
        height: 1.875rem;
        width: 100%;
        transition: all .2s ease-in-out;

        background: transparent;
        margin: 0;
        padding: 0;
        height: auto;
        font-size: 13px;
        text-shadow: none;
        direction: ltr;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        max-width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        flex: 1;
        justify-content: center;
        border-radius: 2px;
    }

</style>
