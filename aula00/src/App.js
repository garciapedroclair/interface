import React from "react";
import { Bar } from "react-chartjs-2";
import data from "./data.json"; // Import the JSON file directly

const PerformanceChart = () => {
  // Process the data from JSON
  const years = Object.keys(data.data);
  const means = years.map(
    (year) => data.data[year].reduce((sum, grade) => sum + grade, 0) / data.data[year].length
  );

  // Prepare chart data
  const chartData = {
    labels: years,
    datasets: [
      {
        label: "Average Grades",
        data: means,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2>Student Performance Over the Years</h2>
      <Bar data={chartData} />
    </div>
  );
};

function App() {
  return (
    <div>
      <h1>Learn React</h1>
      <PerformanceChart />
    </div>
  );
}

export default App;
