<script>
export let
    min=0,
    max=100,
    step=1,
    label='',
    value=50,
    postfix='';

</script>

<div class="df w100">
<label >
    {label}
    <input type="range" {min} {max} {step} bind:value >
</label>
    <div class="tfs3">
        {value}{postfix}
    </div>
</div>

<style>
    label{
        flex: 1 0;
        margin-right: 8px;
    }
    input{
        margin-top: 3px;
    }
    .tfs3{

        flex:0 0 110px;
    }
</style>
