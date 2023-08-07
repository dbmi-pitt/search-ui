import React from "react";
import {Bar} from "react-chartjs-2";

class Histogram extends React.Component {
    render() {
        const {data, values} = this.props;

        // calculate frequency of data
        let counts = {};
        for (let i = 0; i < data.length; i++)
            counts[data[i]['key']] = data[i]['doc_count']

        const barData = {
            labels: Object.keys(counts),
            datasets: [
                {
                    backgroundColor: Object.keys(counts).map((i) =>
                        i >= values[0] && i <= values[1]
                            ? "rgba(135, 206, 235, 1)"
                            : "rgba(255, 99, 132, 0.2)"
                    ),
                    hoverBackgroundColor: "rgba(255,99,132,0.4)",
                    data: Object.values(counts)
                }
            ]
        };

        const options = {
            responsive: true,
            legend: {
                display: false
            },
            scales: {
                xAxes: [
                    {
                        display: false
                    }
                ],
                yAxes: [
                    {
                        display: false,
                        ticks: {
                            min: 0
                        }
                    }
                ]
            }
        };
        return <Bar data={barData} options={options}/>;
    }
}

export default Histogram;
