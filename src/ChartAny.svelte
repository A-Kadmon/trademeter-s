<script>
    import { onMount } from "svelte";
    import { debounce } from "./helpers";
    import anychart from "anychart";

    export let data1, data2, data3, stop = false;

    let chart;
    let stopInternal;
    let labelsLine = [];

    const datasetTemplate = {
        borderWidth: 4,
        fill: false,
        pointStyle: false,
        cubicInterpolationMode: "monotone"
    };

    const update = debounce(() => {
        if (stop) update();
        else {
            chart.xAxis().labels(labelsLine);
            chart.data(dataSets);
            chart.draw();
        }
    }, 300);

    function makeDataSet(d1, d2, d3) {
        const arr = [];

        if (Array.isArray(d1) && d1.length > 0) {
            arr.push({
                ...datasetTemplate,
                name: "1 линия",
                stroke: "#fc8f4c",
                data: d1.map((val, idx) => [idx, val])
            });
        }

        if (Array.isArray(d2) && d2.length > 0) {
            arr.push({
                ...datasetTemplate,
                name: "2 линия",
                stroke: "#fc1f4c",
                data: d2.map((val, idx) => [idx, val])
            });
        }

        if (Array.isArray(d3) && d3.length > 0) {
            arr.push({
                ...datasetTemplate,
                name: "3 линия",
                stroke: "#1c8f4c",
                data: d3.map((val, idx) => [idx, val])
            });
        }

        const len = Math.max(d1?.length || 0, d2?.length || 0, d3?.length || 0);
        labelsLine = Array(len + 1)
            .fill()
            .map((e, i) => i);

        update();

        return arr;
    }

    let dataSets = makeDataSet(data1, data2, data3);

    onMount(async () => {
        chart = anychart.line();
        chart.container("chart");
        chart.xAxis().labels(labelsLine);
        chart.data(dataSets);
        chart.draw();
    });
</script>

<div class="pr">
    <div id="chart"></div>
</div>
