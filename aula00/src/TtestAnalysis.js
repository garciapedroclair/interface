import React from "react";
import { jStat } from "jstat";
import data from "./data.json";

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

  return (
    <div>
      <h2>Statistical Analysis: T-tests</h2>
      <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
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
    </div>
  );
};

export default TTestAnalysis;
