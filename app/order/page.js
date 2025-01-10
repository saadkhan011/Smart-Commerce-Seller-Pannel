"use client";
import { useState, useEffect } from "react";
import { Select, Button, Menu, Dropdown, Table, Pagination } from "antd";
import { UploadOutlined, DownOutlined } from "@ant-design/icons";
import { useDeleteMutation, useGetQuery } from "../query";
import { ToastContainer } from "react-toastify";
import OrderDetailsModal from "../components/orderDetailsModal";
import { getMobileOrderColumns, getOrderColumns } from "../components/column";
import { getFilteredMembers, getFilteredMembersById } from "../api";
import withAuth from "../withAuth";

const { Option } = Select;

const OrderTable = () => {
  const [filteredData, setFilteredData] = useState();
  const [memberType, selectedMemberType] = useState();
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [currentPremiumPage, setCurrentPremiumPage] = useState(1); // State for current page
  const [pageSize, setPageSize] = useState(7); // Number of items per page
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const deleteMutation = useDeleteMutation();

  let user;
  if (typeof window !== "undefined") {
    user = JSON.parse(localStorage.getItem("meatmeuserSupplier"));
  }
  let token;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("meatmetokenSupplier");
  }
  const { data, isLoading, error } = useGetQuery({
    queryKey: ["Orders"],
    url: `order/orders-by-supplier/${user?._id}`,
  });
console.log(data)
  useEffect(() => {
    if (data) {
      setFilteredData(data); // Set filtered data to full data initially
    }
  }, [data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const menu = (record) => (
    <Menu>
      <Menu.Item key="1" onClick={() => showModal(record)}>
        View More Details
      </Menu.Item>
      <Menu.Item onClick={() => handleDelete(record)} key="2">
        Delete
      </Menu.Item>
    </Menu>
  );

  const columns = getOrderColumns(menu);
  const mobileColumns = getMobileOrderColumns(menu);

  const showModal = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const typeOfMember = async (e, sup) => {
    const value = e.key || e.target.value;
    selectedMemberType(value);
    if (value === "All") {
      setFilteredData(data); // Show all data if "All" is selected
      return;
    }

    try {
      // Fetch the filtered data based on the selected member type
      const data = await getFilteredMembersById(value, "order", user?._id, token);
      console.log(data);
      setFilteredData(data); // Update filtered data with the response
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (record) => {
    deleteMutation.mutate({
      id: record._id,
      url: `order`,
      queryKey: "Orders",
    });
  };
  // Handle page change
  const onPageChange = (page) => {
    setCurrentPremiumPage(page);
  };
  
  // Paginate the data
  const paginatedData = filteredData
    ? filteredData.slice(
        (currentPremiumPage - 1) * pageSize,
        currentPremiumPage * pageSize
      )
    : [];

  const menuStatus = (
    <Menu onClick={typeOfMember}>
      <Menu.Item key="All">All</Menu.Item>
      <Menu.Item key="Pending">Pending</Menu.Item>
      <Menu.Item key="Approved">Approved</Menu.Item>
      <Menu.Item key="Rejected">Rejected</Menu.Item>
      <Menu.Item key="Shipped">Shipped</Menu.Item>
      <Menu.Item key="Delivered">Delivered</Menu.Item>
    </Menu>
  );

  return (
    <div className="p-4 order-table-dashoboard-product">
      <ToastContainer />
      {/* <h1 className="text-xl font-semibold mb-4 text-black">Order</h1> */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <div className="flex gap-2 items-center">
          <Dropdown overlay={menuStatus}>
            <Button className="bg-[#5a46cf14] text-gray-500 font-normal border-none w-full md:w-[128px] h-[40px]">
              {memberType === "Pending" ||
              memberType === "Approved" ||
              memberType === "Rejected" ||
              memberType === "Shipped" ||
              memberType === "Delivered"
                ? memberType
                : "Status"}{" "}
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>
      <div className="">
        {memberType === "Pending" ||
        memberType === "Approved" ||
        memberType === "Rejected" ||
        memberType === "Shipped" ||
        memberType === "Delivered" ||
        memberType === "Supplier" ? (
          <>
            {" "}
            <Table
              dataSource={paginatedData}
              columns={columns.concat(mobileColumns)}
              rowKey="id"
              pagination={false}
              className="rounded-lg table-responsive"
            />
            {/* Pagination component */}
            <Pagination
              current={currentPremiumPage}
              pageSize={pageSize}
              total={filteredData?.length}
              onChange={onPageChange}
              className="mt-4 flex justify-center"
            />
          </>
        ) : (
          <>
            {" "}
            <Table
              columns={columns.concat(mobileColumns)}
              dataSource={filteredData}
              rowKey="_id"
              pagination={false}
            />
            <Pagination
              className="mt-4 justify-center"
              current={currentPage}
              pageSize={pageSize}
              total={data?.pagination?.totalOrders}
              onChange={(page) => {
                setCurrentPage(page);
              }}
            />
          </>
        )}
      </div>

      <OrderDetailsModal
        isModalVisible={isModalVisible}
        handleOk={handleOk}
        handleCancel={handleCancel}
        setSelectedOrder={setSelectedOrder}
        selectedOrder={selectedOrder}
      />
    </div>
  );
};

export default withAuth(OrderTable);
