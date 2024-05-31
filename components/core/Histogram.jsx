import React from "react";
import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip} from 'chart.js';
import {Bar} from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Histogram = ({data, values}) => {
    const render = () => {

        // calculate frequency of data
        let counts = {};
        for (let i = 0; i < data.length; i++)
            counts[data[i]['key']] = data[i]['doc_count']

        const barData = {
            labels: Object.keys(counts),
            datasets: [
                {
                    barPercentage: 1,
                    barThickness: 10,
                    backgroundColor: Object.keys(counts).map((i) =>
                        i >= values[0] && i <= values[1]
                            ? "#0d6efd"
                            : "#a0c5fc"
                    ),
                    hoverBackgroundColor: "#0b5ed7",
                    data: Object.values(counts)
                }
            ]
        };

        const options = {
            animation: {
                duration: 0
            },
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false,
                }
            }
        };
        return <Bar className="w-100" data={barData} options={options}/>;
    }

    return render()
}

export default Histogram;
