"use client";
import { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Menu,
  Table,
  Pagination,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  useCreateMutation,
  useDeleteMutation,
  useGetQuery,
  useUpdateMutation,
} from "../query";
import { ToastContainer } from "react-toastify";
import { VscKebabVertical } from "react-icons/vsc";
import { TiTick } from "react-icons/ti";
import {
  getCategoryColumns,
  getMobileCategoryColumns,
} from "../components/column";
import withAuth from "../withAuth";
import { FaTicketAlt } from "react-icons/fa";

const { Option } = Select;

const CategoryTable = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(720);
  const [form] = Form.useForm();
  const [filteredData, setFilteredData] = useState();
  const createMutation = useCreateMutation();
  const updateMutation = useUpdateMutation();
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [pageSize, setPageSize] = useState(10); // Number of items per page
  const [subcategories, setSubcategories] = useState([{ value: "", id: "" }]);
  let user;
  if (typeof window !== "undefined") {
    user = JSON.parse(localStorage.getItem("meatmeuserSupplier"));
  }
  const { data, isLoading, error } = useGetQuery({
    queryKey: ["Category"],
    url: `category/get-subcategories/${user?._id}`,
  });
  const deleteMutation = useDeleteMutation();
  console.log(data);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDrawerWidth(window.innerWidth < 768 ? "100%" : 720);
    }
    if (data) {
      setFilteredData(data.filter(item => item.status === "Active")); // Set filtered data to full data initially
    }
  }, [data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleAddSubcategory = () => {
    setSubcategories([...subcategories, { value: "", id: "" }]);
  };

  const handleRemoveSubcategory = (index, sub) => {
    if (editingRecord) {
      deleteMutation.mutate(
        {
          id: sub?.id,
          url: `category/delete-subcategory/${editingRecord?._id}`,
          queryKey: "Category",
        },
        {
          onSuccess: () => {
            const newSubcategories = subcategories.filter((_, i) => i !== index);
            setSubcategories(newSubcategories);
          },
          onError: () => {
            console.log("Error deleting subcategory");
          },
        }
      );
    } else {
      const newSubcategories = subcategories.filter((_, i) => i !== index);
      setSubcategories(newSubcategories);
    }
  };
  

  const handleUpdateSubcategory = (index, sub) => {
    let url;
    let queryKey = "Category";
    console.log(sub, "si=ub")
    url = `category/update-subcategory/${editingRecord?._id}/${sub?.id}`;
    updateMutation.mutate(
      {
        data: { name: sub?.value },
        url,
        queryKey,
      },
      {
        onSuccess: () => {
          handleCancel();
        },
        onError: (error) => {
          console.error("Error updating supplier:", error);
        },
      }
    );
  };

  const handleSubcategoryChange = (index, event) => {
    const newSubcategories = [...subcategories];
    newSubcategories[index].value = event.target.value;
    setSubcategories(newSubcategories);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      status: record.status,
    });
    // Set the subcategories
    setSubcategories(
      record.subcategories.map((sub) => ({ value: sub.name, id: sub._id }))
    );
    // Set image preview if image exists
    setEditingRecord(record); // Set the record being edited
    showDrawer(); // Show the drawer
  };

  const menu = (record) => (
    <Menu>
      <Menu.Item key="1" onClick={() => handleEdit(record)}>
        Edit
      </Menu.Item>
    </Menu>
  );

  const columns = getCategoryColumns(menu);
  const mobileColumns = getMobileCategoryColumns(menu);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setEditingRecord(null); // Clear the editing record
    form.resetFields();
    setSubcategories([{ value: "" }]);
    setDrawerVisible(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields().then((values) => {
        const formattedValues = {
          ...values,
          subcategories: subcategories.map((sub) => sub.value),
        };
        return formattedValues; // Return the formattedValues
      });
      console.log(values);

      let url = `category/add-subcategory/${values?.category}`;
      let queryKey = "Category";
      createMutation.mutate(
        { data: { ...values, supplierId: user?._id }, url, queryKey },
        {
          onSuccess: () => {
            form.resetFields();
            closeDrawer();
          },
          onError: (error) => {
            console.error("Error updating supplier:", error);
          },
        }
      );
      // Reset subcategories
      setSubcategories([{ value: "" }]);

      // Send formData to your mutation or API endpoint
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <div className="p-4 order-table-dashoboard-product">
      <ToastContainer />
      {/* <h1 className="text-xl font-semibold mb-4 text-black">Categories</h1> */}
      <div className="flex flex-col md:flex-row justify-end mb-4">
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            onClick={showDrawer}
            className="bg-[#5a46cf] text-white border-none py-5 w-full md:w-auto"
          >
            + Add Sub-Category
          </Button>
        </div>
      </div>
      <div className="">
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
          total={data?.pagination?.totalCategories}
          onChange={(page) => {
            setCurrentPage(page);
          }}
        />
      </div>

      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{editingRecord ? "Edit Product" : "Add Product"}</span>
            <CloseOutlined
              style={{ cursor: "pointer", fontSize: "20px" }}
              onClick={closeDrawer}
            />
          </div>
        }
        width={drawerWidth}
        onClose={closeDrawer}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        closable={false} // Remove the default close icon
      >
        <Form
          layout="vertical"
          hideRequiredMark
          form={form}
          className="w-full md:w-[80%] mx-auto"
        >
          {!editingRecord && (
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true }]}
              className="select-hover"
            >
              <Select
                className="bg-[#EBEBEB3D]"
                // onChange={(value) => setEditingRecord(value)}
              >
                {filteredData &&
                  filteredData.map((category) => (
                    <Option
                      key={category._id}
                      value={category._id}
                      className="bg-white text-gray-500 border-none py-3 px-2"
                    >
                      {category.name}
                      {category.status === "Inactive" && (
                        <span className="font-semibold text-red-400">
                          {" "}
                          (Inactive)
                        </span>
                      )}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item label="Subcategories">
            {subcategories &&
              subcategories.map((sub, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Input
                    value={sub.value}
                    onChange={(e) => handleSubcategoryChange(index, e)}
                    className="py-3 bg-[#EBEBEB3D] flex-grow"
                    placeholder={`Subcategory ${index + 1}`}
                  />
                  {editingRecord && (
                    <Button
                      type="link"
                      icon={<TiTick className="text-xl text-green-500" />}
                      onClick={() => handleUpdateSubcategory(index, sub)} // Pass the current input value here
                    />
                  )}

                  <Button
                    type="link"
                    icon={<MinusCircleOutlined />}
                    onClick={() => handleRemoveSubcategory(index, sub)}
                    disabled={subcategories.length === 1} // Disable removal if only one subcategory left
                  />
                </div>
              ))}
            {!editingRecord && (
              <Button
                type="dashed"
                onClick={handleAddSubcategory}
                className="flex items-center"
                icon={<PlusOutlined />}
              >
                Add Subcategory
              </Button>
            )}
          </Form.Item>

          {!editingRecord && (
            <div className="flex justify-between gap-5">
              <button
                className="bg-[#A8A8A83D] text-gray-800 border-none py-2 w-1/2 rounded-md"
                onClick={closeDrawer}
                type="button"
              >
                {" "}
                cancel
              </button>
              <button
                className="bg-[#5a46cf] text-white border-none py-2 w-1/2 rounded-m"
                onClick={handleSave}
              >
                {" "}
                save
              </button>
            </div>
          )}
        </Form>
      </Drawer>
    </div>
  );
};

export default withAuth(CategoryTable);
