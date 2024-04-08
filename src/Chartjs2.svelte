<script>
    import { onMount } from 'svelte';
    import {LineController, Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';
    import { debounce } from './helpers.js';

    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Sales',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    };

    let chart;

    const updateChart = debounce(() => {
        if (chart) chart.update();
    }, 300);

    onMount(() => {
        console.log('onMount()');
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');

        console.log('Registering chart controllers');
        Chart.register(
            LineController,
            LineElement,
            PointElement,
            LinearScale,
            CategoryScale,
            Tooltip,
        );

        console.log('Creating new chart');
        chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // console.log(Chart.registerables);
        // console.log(Chart.registered);

        console.log('Chart created successfully');
    });
</script>

<canvas on:resize={updateChart}></canvas>
