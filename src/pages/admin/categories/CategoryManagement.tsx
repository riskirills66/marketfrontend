import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, Modal, Space, Spin, Table, Typography, message, Image } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, MenuOutlined } from "@ant-design/icons";
import { Category } from "../../../types";
import { apiClient } from "../../../api";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title } = Typography;

const DragHandle = ({ id }: { id: number }) => {
  const { attributes, listeners } = useSortable({ id });
  return (
    <MenuOutlined
      style={{ cursor: 'grab', color: '#999' }}
      {...attributes}
      {...listeners}
    />
  );
};

const SortableRow = ({ children, ...props }: any) => {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props['data-row-key'] });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style}>
      {children}
    </tr>
  );
};

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (error) {
      message.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);

      // Update sort_order on backend
      try {
        const updatedOrders = newCategories.map((cat, index) => ({
          id: cat.id,
          sort_order: index,
        }));
        await apiClient.updateCategoriesSortOrder(updatedOrders);
        message.success("Category order updated");
      } catch (error) {
        message.error("Failed to update category order");
        fetchCategories(); // Revert on error
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      pict: category.pict || "",
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Delete Category",
      content: "Are you sure you want to delete this category? Items with this category will have their category set to null.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await apiClient.deleteAdminCategory(id);
          message.success("Category deleted successfully");
          fetchCategories();
        } catch (error) {
          message.error("Failed to delete category");
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await apiClient.updateAdminCategory(editingCategory.id, {
          name: values.name,
          pict: values.pict || undefined,
        });
        message.success("Category updated successfully");
      } else {
        await apiClient.createAdminCategory({
          name: values.name,
          pict: values.pict || undefined,
        });
        message.success("Category created successfully");
      }
      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error("A category with this name already exists");
      } else {
        message.error(`Failed to ${editingCategory ? "update" : "create"} category`);
      }
    }
  };

  const columns = [
    {
      title: "",
      key: "drag",
      width: 40,
      render: (_: any, record: Category) => <DragHandle id={record.id} />,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Image",
      dataIndex: "pict",
      key: "pict",
      width: 120,
      render: (pict: string | null) => {
        if (pict) {
          return (
            <Image
              src={pict}
              alt="Category"
              width={60}
              height={60}
              style={{ objectFit: "cover", borderRadius: "4px" }}
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
            />
          );
        }
        return <span style={{ color: "#999" }}>No image</span>;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Image URL",
      dataIndex: "pict",
      key: "pict",
      render: (pict: string | null) => (
        <span style={{ fontSize: "12px", color: "#666", maxWidth: "200px", display: "inline-block", overflow: "hidden", textOverflow: "ellipsis" }}>
          {pict || "—"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <Title level={3}>Category Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add New Category
        </Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((cat) => cat.id)}
              strategy={verticalListSortingStrategy}
            >
              <Table
                dataSource={categories}
                columns={columns}
                rowKey="id"
                pagination={false}
                components={{
                  body: {
                    row: SortableRow,
                  },
                }}
              />
            </SortableContext>
          </DndContext>
        </Spin>
      </Card>

      <Modal
        title={editingCategory ? "Edit Category" : "Add New Category"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: "16px" }}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item
            name="pict"
            label="Image URL"
            extra="Optional: URL to the category image/icon"
          >
            <Input placeholder="Enter image URL" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;

