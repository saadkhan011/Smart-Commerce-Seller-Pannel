import React from "react";
import {
  Modal,
  Descriptions,
  List,
  Typography,
  Dropdown,
  Menu,
  Button,
  Tag,
} from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { useUpdateMutation } from "../query";

const OrderDetailsModal = ({
  isModalVisible,
  handleOk,
  handleCancel,
  selectedOrder,
  setSelectedOrder,
}) => {
  const updateMutation = useUpdateMutation();

  const handleStatusChange = (record, status) => {
    const url = `order/update-status-byitemId/${record?._id}/${record?.orderId}`;
    updateMutation.mutate(
      {
        data: { status },
        url,
        queryKey: "Orders",
      },
      {
        onSuccess: () => {
          handleOk();
        },
      }
    );
  };

  const renderActionMenu = (item) => (
    <Menu>
      {item.status !== "Approved" && (
        <Menu.Item onClick={() => handleStatusChange(item, "Approved")} key="3">
          Approved
        </Menu.Item>
      )}
      {item.status !== "Pending" && (
        <Menu.Item onClick={() => handleStatusChange(item, "Pending")} key="4">
          Pending
        </Menu.Item>
      )}
      {item.status !== "Shipped" && (
        <Menu.Item onClick={() => handleStatusChange(item, "Shipped")} key="5">
          Shipped
        </Menu.Item>
      )}
      {item.status !== "Delivered" && (
        <Menu.Item
          onClick={() => handleStatusChange(item, "Delivered")}
          key="6"
        >
          Delivered
        </Menu.Item>
      )}
      {item.status !== "Rejected" && (
        <Menu.Item onClick={() => handleStatusChange(item, "Rejected")} key="7">
          Rejected
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <Modal
      title="Order Details"
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1000}
    >
      {selectedOrder && (
        <div>
          {/* buyer Information */}
          <Descriptions title="Buyer Information" bordered>
            <Descriptions.Item label="Buyer Name" span={3}>
              {selectedOrder?.buyerId?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Buyer Email" span={3}>
              {selectedOrder?.buyerId?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone Number" span={3}>
              {selectedOrder?.buyerId?.phone}
            </Descriptions.Item>
          </Descriptions>

          {/* Order Information */}
          <Descriptions
            title="Order Information"
            bordered
            style={{ marginTop: "16px" }}
          >
            <Descriptions.Item label="Order ID">
              {selectedOrder._id}
            </Descriptions.Item>
            <Descriptions.Item label="Order Date">
              {new Date(selectedOrder?.orderDate).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedOrder?.status}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              ${selectedOrder?.price}
            </Descriptions.Item>
            <Descriptions.Item label="Shipping Address" span={3}>
              {selectedOrder?.shippingAddress}
            </Descriptions.Item>
          </Descriptions>

          {/* Ordered Items */}
          <List
            header={<div style={{ fontWeight: "bold" }}>Ordered Items</div>}
            bordered
            dataSource={[selectedOrder]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Dropdown
                    overlay={renderActionMenu(item)}
                    trigger={["click"]}
                    key="dropdown"
                  >
                    <Button type="text" icon={<EllipsisOutlined />} />
                  </Dropdown>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Typography.Text>{item?.productId?.name}</Typography.Text>
                  }
                  description={
                    <>
                      <div>Category: {item?.productId?.category}</div>
                      <div>
                        Supplier: {item?.supplierId?.name} (
                        {item?.supplierId?.email})
                      </div>
                      <div>Price: ${item?.price}</div>
                      <div>Quantity: {item?.quantity}</div>
                      <Tag
                        color={
                          item?.status === "Delivered" ? "green" : "volcano"
                        }
                        style={{ borderRadius: "10px", marginTop: "5px" }}
                      >
                        {item?.status.toUpperCase()}
                      </Tag>
                    </>
                  }
                />
              </List.Item>
            )}
            style={{ marginTop: "16px" }}
          />
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailsModal;
