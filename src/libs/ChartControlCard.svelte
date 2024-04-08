<div class="dfc gap card1">
    <div class="tfs2"><slot></slot></div>

    <Switch
            bind:val={graph.show}
    >Показать</Switch>

    <Switch
            bind:val={graph.freeze}
    >Заморозить</Switch>

    <Switch
            bind:val={graph.RD_scale}
    >Учитывать % из РД</Switch>
    <Switch
            bind:val={graph.RD_pays}
    >Учитывать ввод/вывод из РД</Switch>
    <Switch
            bind:val={graph.bonds}
    >Учитывать бонды</Switch>
</div>

<script>
    import Switch from "./Switch.svelte";

    export let graph;
</script>
