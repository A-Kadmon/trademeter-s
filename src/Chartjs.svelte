<script>


    import {onMount} from "svelte";
    import {debounce, num2str} from "./helpers";


    // import {CategoryScale, Chart as ChartJS, LinearScale, LineController, LineElement, PointElement, Tooltip} from 'chart.js';
    //
    //
    //
    // ChartJS.register(
    //     LineController,
    //     LineElement,
    //     PointElement,
    //     LinearScale,
    //     CategoryScale,
    //     Tooltip,
    // );

    export let data1, data2, data3, stop = false, graphs

    let stopInternal

    // export let realData={};

    const datasetTemplate = {
        // label: '1 линия',
        borderWidth: 4,
        // borderColor: '#fc8f4c',
        // radius: 0,
        pointRadius: 0,
        pointHoverRadius: 8,
        fill: false,
        // pointStyle: false, //'circle',
        cubicInterpolationMode: 'monotone',
        //data: data2
    }

    export const update = debounce(() => {
        if( stop ) update()
        else {
            if( chart?.data )
            {
                chart.data.labels= labelsLine;

                if(!graphs[1].freeze && dataSets[0]) chart.data.datasets[0] = dataSets[0];
                if(!graphs[2].freeze && dataSets[1]) chart.data.datasets[1] = dataSets[1];
                if(!graphs[3].freeze && dataSets[2]) chart.data.datasets[2] = dataSets[2];

                // console.log('ch c v')
                chart.setDatasetVisibility(0, graphs[1].show);
                chart?.setDatasetVisibility(1, graphs[2].show);
                chart?.setDatasetVisibility(2, graphs[3].show);

                chart?.update();
            }
        }
        // chart?.update()
    }, 60);

    function makeDataSet(d1, d2, d3) {
        const arr = [];
        // console.log('reset DS')
        // alert( JSON.stringify(d1) )
        if ( graphs[1].show && Array.isArray(d1) && d1.length > 0) arr.push({
            ...datasetTemplate,
            label: ' График 1',
            borderColor: '#1d66c4',
            data: d1
        });
        else arr.push({})
        if ( graphs[2].show && Array.isArray(d2) && d2.length > 0) arr.push({
            ...datasetTemplate,
            label: ' График 2',
            borderColor: '#338d76',
            data: d2
        });
        else arr.push({})
        if (graphs[3].show && Array.isArray(d3) && d3.length > 0) arr.push({
            ...datasetTemplate,
            label: ' График 3',
            borderColor: '#d32047',
            data: d3
        });
        else arr.push({})

        let len = Math.max(d1?.length || 0, d2?.length || 0, d3?.length || 0);

        labelsLine = Array(len +1 ).fill().map((e, i) => i+1);

        update();

        return arr
    }

    $: dataSets = (graphs, makeDataSet(data1, data2, data3 ) );

    let labelsLine;


    const startChart = async (promise) => {

        // const ChartJS = await import('chart.js/auto');

        let { CategoryScale, Chart, LineController, LineElement, LinearScale, PointElement, Tooltip } = await import('/cj7u8.js');;

        Chart.register(
            LineController,
            LineElement,
            PointElement,
            LinearScale,
            CategoryScale,
            Tooltip,
        );


        ctx = chartCanvas.getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labelsLine,
                datasets: dataSets
            },
            options: {
                animation: {
                    duration: 300 // set the animation duration to 500 milliseconds
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(ctx) {

                                // console.log( ctx )
                                let x = ctx[0].dataIndex;

                                let str = [ 'Конец ' + x + ' дня.',
                                            'Начало ' + (x+1) + ' дня' ]
                                if( x==0 ) str.shift();
                                return str;
                            }
                        }
                    }
                }
                // scales: {
                //     xAxes: [{
                //         ticks: {
                //             beginAtZero: true
                //         },
                //         scaleLabel: {
                //             display: true,
                //             labelString: 'X Axis Label'
                //         }
                //     }],
                //     yAxes: [{
                //         ticks: {
                //             beginAtZero: true
                //         },
                //         scaleLabel: {
                //             display: true,
                //             labelString: 'Y Axis Label'
                //         }
                //     }]
                // }
            }
        })
    }

    onMount(async () => {

        let timer = setTimeout(startChart, 100);
    })

    let chart;
    let chartCanvas, ctx;
</script>
<!--<pre>-->
<!--{JSON.stringify( dataSets, null, 4 )}</pre>-->
<div class="pr" style="height: 100%">
    <canvas bind:this={chartCanvas} id="chart"></canvas>
</div>


<style>
    #chart{
        height: 100%;
    }
</style>
