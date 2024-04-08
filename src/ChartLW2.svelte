<script>
    import { onMount } from 'svelte';
    import { createChart } from 'lightweight-charts';

    const data = [
        { index: 0, value: 10 },
        { index: 1, value: 20 },
        { index: 2, value: 15 },
        { index: 3, value: 30 },
    ];

    let chart;

    let container;

    onMount(() => {
        // Create a custom TimeScale object that maps the index values to time values
        const timeScale = {
            indexToTime: (index) => index, // Maps the index to itself
            timeToIndex: (time) => time, // Maps the time to itself
        };

        // Create the chart using the custom TimeScale object
        chart = createChart(container, {
            // timeScale: timeScale,
        });

        // Add the series to the chart
        const series = chart.addLineSeries();
        //series.setData(data.map((d) => ({ time: d.index, value: d.value })));


        series.setData([
            { time: '2019-04-11', value: 80.01 },
            { time: '2019-04-12', value: 96.63 },
            { time: '2019-04-13', value: 76.64 },
            { time: '2019-04-14', value: 81.89 },
            { time: '2019-04-15', value: 74.43 },
            { time: '2019-04-16', value: 80.01 },
            { time: '2019-04-17', value: 96.63 },
            { time: '2019-04-18', value: 76.64 },
            { time: '2019-04-19', value: 81.89 },
            { time: '2019-04-20', value: 74.43 },
        ]);
    });
</script>

<div bind:this="{container}"></div>
