import React from "react";
import Plot from "react-plotly.js";
import { jStat } from "jstat";

function MyBoxPlot() {
    const data2022 = [85, 78, 92, 75, 88];
    const data2023 = [82, 76, 90, 80, 85];
    const data2024 = [88, 84, 91, 77, 83];

    const plotData = [
        { y: data2022, type: "box", name: "2022" },
        { y: data2023, type: "box", name: "2023" },
        { y: data2024, type: "box", name: "2024" },
    ];

     // Function to perform a two-sample t-test
     const performTTest = (data1, data2) => {
        const meanDiff = jStat.mean(data1) - jStat.mean(data2);
        const pooledVariance =
            (jStat.variance(data1, true) / data1.length) +
            (jStat.variance(data2, true) / data2.length);
        const tStatistic = meanDiff / Math.sqrt(pooledVariance);
        const degreesOfFreedom =
            data1.length + data2.length - 2;

        // Two-tailed p-value
        const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStatistic), degreesOfFreedom));
        return { tStatistic: tStatistic.toFixed(3), pValue: pValue.toFixed(5) };
    };

     // Perform t-tests
     const tTest2022vs2023 = performTTest(data2022, data2023);
     const tTest2023vs2024 = performTTest(data2023, data2024);
     const tTest2022vs2024 = performTTest(data2022, data2024);

    return (
        <div style={{ display: "flex" }}>
            <div>
                <Plot 
                    data={plotData} 
                    layout={
                        {title: "Students Grade", 
                        yaxis: { title: "Grades" }, 
                        xaxis: { title: "years" }, 
                        boxmode: "group"}} 
                />
            </div>
            <div style={{ marginLeft: "20px" }}>
                <h1>T-Test Results</h1>
                <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr>
                            <th>Comparison</th>
                            <th>T-Statistic</th>
                            <th>P-Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>2022 vs 2023</td>
                            <td>{tTest2022vs2023.tStatistic}</td>
                            <td>{tTest2022vs2023.pValue}</td>
                        </tr>
                        <tr>
                            <td>2023 vs 2024</td>
                            <td>{tTest2023vs2024.tStatistic}</td>
                            <td>{tTest2023vs2024.pValue}</td>
                        </tr>
                        <tr>
                            <td>2022 vs 2024</td>
                            <td>{tTest2022vs2024.tStatistic}</td>
                            <td>{tTest2022vs2024.pValue}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MyBoxPlot;