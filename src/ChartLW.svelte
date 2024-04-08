<script>
    import { onMount } from 'svelte';
    import { createChart, LineStyle } from 'lightweight-charts';
    import { debounce } from './helpers';

    export let data1, data2, data3, stop = false;

    let chart;
    let chartContainer;
    let stopInternal;

    const datasetTemplate = {
        lineWidth: 4,
        color: '#fc8f4c',
        visible: true,
        title: '1 линия',
        data: [],
    };

    export const update = debounce(() => {
        if (stop) update();
        else {
            chart.applyOptions({
                timeScale: {
                    visible: false,
                },
                priceScale: {
                    visible: true,
                    autoScale: true,
                },
            });
            chart.timeScale().fitContent();
            chart.timeScale().scrollToPosition(0);
        }
    }, 300);

    function makeDataSet(d1, d2, d3) {
        const arr = [];

        if (Array.isArray(d1) && d1.length > 0)
            arr.push({
                ...datasetTemplate,
                color: '#fc8f4c',
                title: '1 линия',
                data: d1.map((d, i) => ({ time: i, value: d })),
            });
        if (Array.isArray(d2) && d2.length > 0)
            arr.push({
                ...datasetTemplate,
                color: '#fc1f4c',
                title: '2 линия',
                data: d2.map((d, i) => ({ time: i, value: d })),
            });
        if (Array.isArray(d3) && d3.length > 0)
            arr.push({
                ...datasetTemplate,
                color: '#1c8f4c',
                title: '3 линия',
                data: d3.map((d, i) => ({ time: i, value: d })),
            });

        update();

        return arr;
    }

    $: dataSets = makeDataSet(data1, data2, data3);

    const startChart = async () => {
        chart = createChart(chartContainer, {
            width: chartContainer.offsetWidth,
            height: chartContainer.offsetHeight,
        });

        const lineSeries = chart.addLineSeries({
            lineStyle: LineStyle.Solid,
            lineWidth: 2,
            crosshairMarkerVisible: false,
            lastValueVisible: false,
        });

        lineSeries.setData(dataSets[0].data);
        lineSeries.applyOptions(dataSets[0]);

        for (let i = 1; i < dataSets.length; i++) {
            const newSeries = chart.addLineSeries({
                lineStyle: LineStyle.Solid,
                lineWidth: 2,
                crosshairMarkerVisible: false,
                lastValueVisible: false,
            });

            newSeries.setData(dataSets[i].data);
            newSeries.applyOptions(dataSets[i]);
        }
    };

    onMount(async () => {
        chartContainer = document.querySelector('.chart-container');

        startChart();
    });
</script>

<div class="chart-container"></div>
