import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { API_BASE_URL } from "../api";

// Dynamically import ReactApexChart to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const ApexChart = ({ supplierId }) => {
  const [chartData, setChartData] = useState({
    series: [
      { name: "Revenue", data: [] },
      { name: "Commission Fees", data: [] },
      { name: "Delivery Fees", data: [] },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show: false },
      },
      colors: ["#5a46cf", "#00d049", "#8626d9"],
      xaxis: {
        categories: [],
      },
      yaxis: {
        title: { text: "Values" },
      },
      fill: { opacity: 1 },
      legend: { position: "right", offsetX: 0, offsetY: 50 },
      tooltip: {
        theme: "dark",
        style: { fontSize: "12px" },
      },
    },
  });

  // Fetch chart data from the API with optional supplierId
  const fetchChartData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/apex-chart-data`,
        {
          params: { supplierId }, // Pass supplierId as a query parameter if available
        }
      );
      const { series, categories } = response.data;
      setChartData((prev) => ({
        ...prev,
        series,
        options: {
          ...prev.options,
          xaxis: { categories },
        },
      }));
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    // Fetch chart data on component mount
    if (supplierId) fetchChartData();
    console.log(supplierId, "userid");
  }, []);

  return (
    <div>
      {/* Apex chart */}
      <div>
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

export default ApexChart;
