"use client";
import React from "react";
import Cards from "../components/card";
import Charts from "../components/charts";
import NewOrdersTable from "../components/newOrdersTable";
import withAuth from "../withAuth";
import { useGetQuery } from "../query";

function Dashboard() {
  let user;
  if (typeof window !== "undefined") {
    user = JSON.parse(localStorage.getItem("meatmeuserSupplier"));
  }
  const { data, isLoading, error } = useGetQuery({
    queryKey: ["Dashboard"],
    url: `supplier/dashboard-data/${user?._id}`,
  });
  
  console.log("😊", data)
  let cardData = [];
  if (data) {
    cardData = [
      {
        title: "Total Sales",
        value: data.totalPrice || 0,
        change: "+ overAll",
        color: "bg-red-100",
      },
      {
        title: "Total Orders",
        value: data?.totalOrders || 0,
        change: "+ overAll",
        color: "bg-yellow-100",
      },
      {
        title: "Pending Orders",
        value: data?. pendingOrders || 0,
        change: "+ overAll",
        color: "bg-green-100",
      },
      {
        title: "Delivered Orders",
        value: data?.deliveredOrders || 0,
        change: "+ overAll",
        color: "bg-purple-100",
      },
      {
        title: "Today Orders",
        value: data?.todayOrders || 0,
        change: "+ overAll",
        color: "bg-blue-100",
      },
    ];
  }
  return (
    <div>
      <Cards cards={cardData} />
      <Charts graphData={data}/>
      <NewOrdersTable />
    </div>
  );
}

export default withAuth(Dashboard);
