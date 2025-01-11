import JsonData from "./data/data.json";
import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse"; // Import PapaParse
import { jStat } from "jstat"; // Import jStat for t-test calculations

// Filter component
const Filter = () => {
    const [data, setData] = useState([]);
    const [genderFilter, setGenderFilter] = useState(""); // Gender filter
    const [topicFilter, setTopicFilter] = useState(""); // Topic filter
    const [frequencyFilter, setFrequencyFilter] = useState([0, 1]); // Frequency range filter
    const [openEndedFilter, setOpenEndedFilter] = useState(null); // Open-ended filter (null, 0, 1)

    useEffect(() => {
        // Fetch data from the local JSON file
        setData(JsonData);
    }, []);

    // Filter data based on the selected filters
    const filteredData = data.filter((item) => {
        const withinFrequencyRange =
            item.frequency >= frequencyFilter[0] && item.frequency <= frequencyFilter[1];
        const matchesGender = genderFilter ? item.gender === genderFilter : true;
        const matchesTopic = topicFilter ? item.topic === topicFilter : true;

        // Open-ended filter: Check if open_ended matches the filter
        const matchesOpenEnded =
            openEndedFilter === null || item.open_ended === openEndedFilter;

        return withinFrequencyRange && matchesGender && matchesTopic && matchesOpenEnded;
    });

    // Separate data by semester (year)
    const data2019 = filteredData.filter((item) => item.semester.startsWith("2019"));
    const data2022 = filteredData.filter((item) => item.semester.startsWith("2022"));
    const data2023 = filteredData.filter((item) => item.semester.startsWith("2023"));

    // Prepare boxplot data for each year
    const boxplot2019 = {
        type: "box",
        name: "2019",
        y: data2019.map((item) => item.grade), // Extract grades for 2019
    };

    const boxplot2022 = {
        type: "box",
        name: "2022",
        y: data2022.map((item) => item.grade), // Extract grades for 2022
    };

    const boxplot2023 = {
        type: "box",
        name: "2023",
        y: data2023.map((item) => item.grade), // Extract grades for 2023
    };

    // Function to calculate the t-test
    const calculateTTest = (arr1, arr2) => {
        if (arr1.length < 2 || arr2.length < 2) return { tStatistic: "N/A", pValue: "N/A" };

        const mean1 = jStat.mean(arr1);
        const mean2 = jStat.mean(arr2);
        const var1 = jStat.variance(arr1, true);
        const var2 = jStat.variance(arr2, true);
        const n1 = arr1.length;
        const n2 = arr2.length;

        const pooledVariance = Math.sqrt(var1 / n1 + var2 / n2);
        const tStatistic = (mean1 - mean2) / pooledVariance;

        const degreesOfFreedom =
            Math.pow(var1 / n1 + var2 / n2, 2) /
            ((Math.pow(var1 / n1, 2) / (n1 - 1)) + (Math.pow(var2 / n2, 2) / (n2 - 1)));

        const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStatistic), degreesOfFreedom));
        return { tStatistic: tStatistic.toFixed(2), pValue: pValue.toFixed(5) };
    };

    // Calculate t-test results
    const tTestResults = [];
    const yearPairs = [
        { year1: "2019", year2: "2022", data1: data2019.map((d) => d.grade), data2: data2022.map((d) => d.grade) },
        { year1: "2019", year2: "2023", data1: data2019.map((d) => d.grade), data2: data2023.map((d) => d.grade) },
        { year1: "2022", year2: "2023", data1: data2022.map((d) => d.grade), data2: data2023.map((d) => d.grade) },
    ];

    yearPairs.forEach(({ year1, year2, data1, data2 }) => {
        const { tStatistic, pValue } = calculateTTest(data1, data2);
        tTestResults.push({
            yearPair: `${year1} vs ${year2}`,
            tStatistic,
            pValue,
            significant: pValue !== "N/A" && pValue < 0.05 ? "Yes" : "No",
        });
    });

    // Function to export filtered data to CSV
    const exportToCSV = () => {
        const csv = Papa.unparse(filteredData);
        const link = document.createElement("a");
        link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
        link.target = "_blank";
        link.download = "filtered_data.csv";
        link.click();
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "center", padding: "10px", backgroundColor: "gray", border: "2px solid #ccc", borderRadius: "10px", gap: "20px" }}>
                {/* Gender Filter */}
                <div style={{ backgroundColor: "#f0f0f0", border: "2px solid #ccc", borderRadius: "5px" }}>
                    <label style={{ marginRight: "10px", backgroundColor: "#f0f0f0" }}>Gender:</label>
                    <select onChange={(e) => setGenderFilter(e.target.value)} value={genderFilter}>
                    <option value="">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    </select>
                </div>

                {/* Topic Filter */}
                <div style={{ backgroundColor: "#f0f0f0", border: "2px solid #ccc", borderRadius: "5px" }}>
                    <label style={{ marginRight: "10px" }}>Topic:</label>
                    <select onChange={(e) => setTopicFilter(e.target.value)} value={topicFilter}>
                    <option value="">All</option>
                    <option value="SE Introduction">SE Introduction</option>
                    <option value="Software Processes and Agile Methods">Software Processes and Agile Methods</option>
                    <option value="Software Requirements and Use Cases">Software Requirements and Use Cases</option>
                    <option value="Design with UML">Design with UML</option>
                    <option value="Implementation">Implementation</option>
                    <option value="Software Testing and Software Quality">Software Testing and Software Quality</option>
                    <option value="Software Architecture">Software Architecture</option>
                    </select>
                </div>

                {/* Frequency Filter */}
                <div style={{ backgroundColor: "#f0f0f0", border: "2px solid #ccc", borderRadius: "5px" }}>
                    <label style={{ marginRight: "10px" }}>Frequency:</label>
                    <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={frequencyFilter[0]}
                    onChange={(e) => setFrequencyFilter([parseFloat(e.target.value), frequencyFilter[1]])}
                    style={{ width: "50px", marginRight: "5px" }}
                    />
                    <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={frequencyFilter[1]}
                    onChange={(e) => setFrequencyFilter([frequencyFilter[0], parseFloat(e.target.value)])}
                    style={{ width: "50px" }}
                    />
                </div>

                {/* Question Type Filter */}
                <div style={{ backgroundColor: "#f0f0f0", border: "2px solid #ccc", borderRadius: "5px" }}>
                    <label style={{ marginRight: "10px" }}>Question Type:</label>
                    <select
                    onChange={(e) => setOpenEndedFilter(e.target.value === "" ? null : Number(e.target.value))}
                    value={openEndedFilter === null ? "" : openEndedFilter}
                    >
                    <option value="">All</option>
                    <option value="0">Closed</option>
                    <option value="1">Open-ended</option>
                    </select>
                </div>
            </div>
                
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px" }}>
                {/* Gráfico */}
                <div style={{ flex: 1, marginRight: "20px" }}>
                    <Plot
                    data={[boxplot2019, boxplot2022, boxplot2023]}
                    layout={{
                        title: "Student Grades for 2019, 2022, and 2023",
                        yaxis: { title: "Grade" },
                        xaxis: { title: "Year", type: "category" },
                        width: 600, // Largura do gráfico
                        height: 400, // Altura do gráfico
                    }}
                    />
                </div>

                {/* Tabela de resultados */}
                <div style={{ flex: 1, backgroundColor: "#f9f9f9", border: "1px solid #ccc", borderRadius: "10px", padding: "15px" }}>
                    <h2 style={{ textAlign: "center", marginBottom: "15px" }}>T-Test Results</h2>
                    <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "center",
                        marginBottom: "10px",
                    }}
                    >
                    <thead>
                        <tr style={{ backgroundColor: "#e6e6e6" }}>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Year Pair</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>T-Statistic</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>P-Value</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px" }}>Significant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tTestResults.map((result, index) => (
                        <tr key={index}>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{result.yearPair}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{result.tStatistic}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{result.pValue}</td>
                            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{result.significant}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>

                {/* Botão centralizado */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <button
                    onClick={exportToCSV}
                    style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
                >
                    Export to CSV
                </button>
                </div>
        </div>
    );
};

export default Filter;
