import JsonData from "./data/data.json";
import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse"; // Import PapaParse

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
        x: Array(data2019.length).fill("2019"), // Set x value for each data point
    };

    const boxplot2022 = {
        type: "box",
        name: "2022",
        y: data2022.map((item) => item.grade), // Extract grades for 2022
        x: Array(data2022.length).fill("2022"), // Set x value for each data point
    };

    const boxplot2023 = {
        type: "box",
        name: "2023",
        y: data2023.map((item) => item.grade), // Extract grades for 2023
        x: Array(data2023.length).fill("2023"), // Set x value for each data point
    };

    // Function to export filtered data to CSV
    const exportToCSV = () => {
        // Convert filtered data into CSV format
        const csv = Papa.unparse(filteredData);
        
        // Create a link element to download the file
        const link = document.createElement("a");
        link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
        link.target = "_blank";
        link.download = "filtered_data.csv"; // Set file name for the CSV
        link.click(); // Trigger download
    };

    return (
        <div>    
            {/* Filter UI */}
            <div>
                <label>Gender:</label>
                <select onChange={(e) => setGenderFilter(e.target.value)} value={genderFilter}>
                    <option value="">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>

            <div>
                <label>Topic:</label>
                <select onChange={(e) => setTopicFilter(e.target.value)} value={topicFilter}>
                    <option value="">All</option>
                    <option value="SE Introduction">SE Introduction</option>
                    <option value="Software Procesess and Agile Methods">Software Procesess and Agile Methods</option>
                    <option value="Software Requirements and Use Cases">Software Requirements and Use Cases</option>
                    <option value="Software Architecture">Software Architecture</option>
                    <option value="Design with UML">Design with UML</option>
                    <option value="Implementation">Implementation</option>
                    <option value="Software Testing and Software Quality">Software Testing and Software Quality</option>
                </select>
            </div>

            <div>
                <label>Frequency:</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={frequencyFilter[0]}
                    onChange={(e) => setFrequencyFilter([parseFloat(e.target.value), frequencyFilter[1]])}
                />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={frequencyFilter[1]}
                    onChange={(e) => setFrequencyFilter([frequencyFilter[0], parseFloat(e.target.value)])}
                />
                <span>{`Frequency: ${frequencyFilter[0]} - ${frequencyFilter[1]}`}</span>
            </div>

            {/* Open-ended question filter */}
            <div>
                <label>Question Type:</label>
                <select
                    onChange={(e) => {
                        const value = e.target.value;
                        setOpenEndedFilter(value === "" ? null : Number(value));
                    }}
                    value={openEndedFilter === null ? "" : openEndedFilter}
                >
                    <option value="">All</option>
                    <option value="0">Closed</option>
                    <option value="1">Open-ended</option>
                </select>
            </div>

            {/* Plotting the data */}
            <div>
                <Plot
                    data={[boxplot2019, boxplot2022, boxplot2023]}
                    layout={{
                        title: "Student Grades for 2019, 2022, and 2023",
                        yaxis: {
                            title: "Grade",
                        },
                        xaxis: {
                            title: "Year",
                            type: "category",
                            tickvals: ["2019", "2022", "2023"],
                        },
                        boxmode: "group",
                        showlegend: true,
                    }}
                />
            </div>

            {/* Export CSV Button */}
            <div>
                <button onClick={exportToCSV}>Export to CSV</button>
            </div>
        </div>
    );
};

export default Filter;
