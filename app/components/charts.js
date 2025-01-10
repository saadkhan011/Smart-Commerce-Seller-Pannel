"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api";
import { Button } from "antd";
import { useGetQuery } from "../query";
import ApexChart from "./ApexChart";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const years = [2020, 2021, 2022, 2023, 2024]; // You can add more years as needed
const quarters = ["Q1", "Q2", "Q3", "Q4"];
const monthDays = {
  Jan: 31,
  Feb: 28,
  Mar: 31,
  Apr: 30,
  May: 31,
  Jun: 30,
  Jul: 31,
  Aug: 31,
  Sep: 30,
  Oct: 31,
  Nov: 30,
  Dec: 31,
};

const Chart = () => {
  let user;
  const [selected, setSelected] = useState("Month"); // Default selected button
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [selectedYear, setSelectedYear] = useState(years[0]); // Default year
  const [selectedQuarter, setSelectedQuarter] = useState(quarters[0]); // Default quarter
  const [selectedMonth, setSelectedMonth] = useState(
    monthNames[new Date().getMonth()]
  ); // Default to the current month
  const [selectedValue, setSelectedValue] = useState(
    monthNames[new Date().getMonth()]
  ); // Set initial selected value

  if (typeof window !== "undefined") {
    user = JSON.parse(localStorage.getItem("meatmeuserSupplier"));
  }
  let token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("meatmetokenSupplier");
  }

  const { data, isLoading, error } = useGetQuery({
    queryKey: ["Supplier"],
    url: `supplier/get-buyers-by-supplier-id/${user?._id}`,
  });

  const getDropdownOptions = () => {
    switch (selected) {
      case "Month":
        return monthNames;
      case "Year":
        return years;
      case "Quarter":
        return quarters;
      default:
        return [];
    }
  };

  const handleDropdownChange = (e) => {
    const selectedValue = e.target.value;
    if (selected === "Month") {
      setSelectedMonth(selectedValue);
    } else if (selected === "Year") {
      setSelectedYear(selectedValue);
    } else if (selected === "Quarter") {
      setSelectedQuarter(selectedValue);
    }
    setSelectedValue(selectedValue);
  };

  // Initial chart data
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Sales",
        data: [],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      colors: ["#FF0000"],
      xaxis: {
        type: "category",
        categories: [],
      },
      yaxis: {
        labels: {
          formatter: function (value) {
            return `${value}`;
          },
        },
      },
      tooltip: {
        theme: "dark", // Add this line to change tooltip background color
        style: {
          fontSize: "12px",
          colors: ["#FFF"], // Change tooltip text color
        },
        x: {
          formatter: function (value) {
            return `Day ${value}`;
          },
        },
      },
    },
  });

  // Function to fetch sales data from the API
  const fetchSalesData = async () => {
    let url = `${API_BASE_URL}/supplier/buyer-orders-by-supplierId/${user?._id}?type=${selected}&selectedValue=${selectedValue}`;

    // Add buyer only if buyer has a value
    if (selectedBuyer) {
      url += `&buyerId=${selectedBuyer}`;
    }
    try {
      const response = await axios.get(url, {
        headers: {
          "x-access-token": token,
        },
      });

      const salesData = response.data.data;

      if (Array.isArray(salesData)) {
        const salesAmounts = salesData.map((item) => item.totalOrders);
        let categories = [];
        let tooltipFormatter;

        // Adjust categories and tooltip format based on selected time range
        if (selected === "Month") {
          categories = salesData.map((item) => item.day); // Day of the month
          tooltipFormatter = (value) => `Day ${value}`;
        } else if (selected === "Year") {
          categories = monthNames; // Show month names on x-axis
          tooltipFormatter = (value) => `${value}`; // Show month name in tooltip
        } else if (selected === "Quarter") {
          const quarterMonths = {
            Q1: ["Jan", "Feb", "Mar"],
            Q2: ["Apr", "May", "Jun"],
            Q3: ["Jul", "Aug", "Sep"],
            Q4: ["Oct", "Nov", "Dec"],
          };
          categories = quarterMonths[selectedValue]; // Show months for the selected quarter
          tooltipFormatter = (value) => `${value}`; // Show month name in tooltip
        }

        setChartData((prevData) => ({
          ...prevData,
          series: [
            {
              name: "Sales",
              data: salesAmounts,
            },
          ],
          options: {
            ...prevData.options,
            xaxis: {
              ...prevData.options.xaxis,
              categories, // Set the categories (days, months, etc.) dynamically
            },
            tooltip: {
              ...prevData.options.tooltip,
              x: {
                formatter: tooltipFormatter, // Set tooltip format
              },
            },
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [selected, selectedValue, selectedBuyer]);

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <ApexChart supplierId={user?._id} />
      <div>
        <div className="flex md:flex-row flex-col my-2">
          <div className="md:w-1/2 w-full mt-2">
            <Button
              className={`${
                selected === "Month"
                  ? "bg-[#5a46cf] text-white"
                  : "bg-white hover:bg-[#5a46cf] text-[#5a46cf] border border-[#5a46cf]"
              } rounded-2xl p-4 me-2`}
              onClick={() => setSelected("Month")}
            >
              Month
            </Button>

            <Button
              className={`${
                selected === "Quarter"
                  ? "bg-[#5a46cf] text-white"
                  : "bg-white text-[#5a46cf] border border-[#5a46cf]"
              } rounded-2xl p-4 mx-2`}
              onClick={() => setSelected("Quarter")}
            >
              Quarter
            </Button>

            <Button
              className={`${
                selected === "Year"
                  ? "bg-[#5a46cf] text-white"
                  : "bg-white text-[#5a46cf] border border-[#5a46cf]"
              } rounded-2xl p-4 mx-2`}
              onClick={() => setSelected("Year")}
            >
              Year
            </Button>
          </div>

          <div className="md:w-1/2 w-full mt-2 md:text-end">
            <select
              className="border p-2 text-black"
              value={selectedBuyer}
              onChange={(e) => setSelectedBuyer(e.target.value)} // Add onChange handler here
            >
              <option value="" disabledZ>
                Select Buyer
              </option>
              <option value="">All</option>
              {data &&
                Array.isArray(data) &&
                data.map((element, indx) => (
                  <option key={indx} value={element._id}>
                    {element.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md h-80 md:col-span-2">
          <div className="flex items-center p-2">
            <h3 className="text-black text-xl w-1/2 font-semibold">
              Order Distribution
            </h3>
            <div className="w-1/2 flex justify-end">
              <select
                className="border rounded p-1 px-3 bg-red-50 border-[#5a46cf] text-black"
                value={selectedValue}
                onChange={handleDropdownChange}
              >
                {getDropdownOptions().map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div id="chart">
            <ReactApexChart
              options={chartData.options}
              series={chartData.series}
              type="area"
              height={280}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chart;
