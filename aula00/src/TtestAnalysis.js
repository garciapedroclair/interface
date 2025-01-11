import React from "react";
import { jStat } from "jstat";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import data from "./data.json";

// Register the chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TTestAnalysis = () => {
  const calculateMean = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length;

  const calculateVariance = (arr, mean) =>
    arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (arr.length - 1);

  const calculateTTest = (arr1, arr2) => {
    const mean1 = calculateMean(arr1);
    const mean2 = calculateMean(arr2);
    const var1 = calculateVariance(arr1, mean1);
    const var2 = calculateVariance(arr2, mean2);

    const n1 = arr1.length;
    const n2 = arr2.length;

    const pooledVariance = Math.sqrt(var1 / n1 + var2 / n2);
    const tStatistic = (mean1 - mean2) / pooledVariance;

    // Degrees of freedom
    const df =
      Math.pow(var1 / n1 + var2 / n2, 2) /
      ((Math.pow(var1 / n1, 2) / (n1 - 1)) + (Math.pow(var2 / n2, 2) / (n2 - 1)));

    // Use the jStat library to calculate the p-value
    const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStatistic), df));

    return { tStatistic, pValue };
  };

  const yearKeys = Object.keys(data.data);
  const results = [];

  for (let i = 0; i < yearKeys.length; i++) {
    for (let j = i + 1; j < yearKeys.length; j++) {
      const year1 = yearKeys[i];
      const year2 = yearKeys[j];
      const { tStatistic, pValue } = calculateTTest(data.data[year1], data.data[year2]);
      results.push({
        yearPair: `${year1} vs ${year2}`,
        tStatistic: tStatistic.toFixed(2),
        pValue: pValue.toFixed(5),
        significant: pValue < 0.05 ? "Yes" : "No",
      });
    }
  }

  // Prepare data for the chart
  const chartData = {
    labels: results.map((result) => result.yearPair),
    datasets: [
      {
        label: "T-Statistic",
        data: results.map((result) => parseFloat(result.tStatistic)),
        backgroundColor: results.map((result) =>
          result.significant === "Yes" ? "rgba(75, 192, 192, 0.8)" : "rgba(192, 75, 75, 0.8)"
        ),
        borderColor: "rgba(0, 0, 0, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: (context) => `T-Statistic: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "T-Statistic",
        },
      },
      x: {
        title: {
          display: true,
          text: "Year Pair Comparison",
        },
      },
    },
  };

  return (
    <div>
      <h2>Statistical Analysis: T-tests</h2>

      {/* Table */}
      <table border="1" style={{ borderCollapse: "collapse", width: "100%", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>Year Pair</th>
            <th>T-Statistic</th>
            <th>P-Value</th>
            <th>Significant Difference</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td>{result.yearPair}</td>
              <td>{result.tStatistic}</td>
              <td>{result.pValue}</td>
              <td>{result.significant}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chart */}
      <div>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default TTestAnalysis;
