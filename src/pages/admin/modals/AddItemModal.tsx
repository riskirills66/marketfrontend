import React, { useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, Modal, Space, Tag as AntTag, Typography, message, Row, Col, Select } from "antd";
import { Item, Category } from "../../../types";

const { Text } = Typography;

const AddItemModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onAdd: (item: Omit<Item, "id">) => Promise<void>;
  initialValues?: Item | null;
  categories?: Category[];
}> = ({ visible, onClose, onAdd, initialValues, categories = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        code: initialValues.code,
        description: initialValues.description,
        price: initialValues.price,
        image: initialValues.image_url,
        rating: initialValues.rating,
        weight: initialValues.weight,
        points: initialValues.points,
        tags: initialValues.tags,
        category_id: initialValues.category_id,
      });
      if (initialValues.tags && Array.isArray(initialValues.tags)) {
        setTags(initialValues.tags);
        setTagInput("");
      }
    } else {
      form.resetFields();
      setTags([]);
      setTagInput("");
    }
  }, [initialValues, form]);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value.includes(" ")) {
      setTagInput(value);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !value.includes(" ")) {
        const newTags = [...tags, value];
        setTags(newTags);
        setTagInput("");
        form.setFieldsValue({ tags: newTags });
      }
    } else if (
      e.key === "Backspace" &&
      e.currentTarget.value === "" &&
      tags.length > 0
    ) {
      e.preventDefault();
      const newTags = tags.slice(0, -1);
      setTags(newTags);
      form.setFieldsValue({ tags: newTags });
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    setTagInput("");
    form.setFieldsValue({ tags: newTags });
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const itemData = {
        ...values,
        code: values.code,
        image_url: values.image,
        rating: values.rating ? parseFloat(values.rating) : 0.0,
        price_cut: values.price_cut ? parseFloat(values.price_cut) : 0.0,
        bough_price: values.bough_price ? parseFloat(values.bough_price) : 0.0,
        weight: values.weight ? parseInt(values.weight) : 100,
        points: values.points ? parseInt(values.points) : 0,
        tags: tags.length > 0 ? tags : values.tags,
      };
      delete itemData.image;
      await onAdd(itemData);
      form.resetFields();
      setTags([]);
      setTagInput("");
      onClose();
      message.success("Item berhasil ditambahkan!");
    } catch (error) {
      message.error("Gagal menambahkan item. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Tambah Item Baru" open={visible} onCancel={onClose} footer={null} width={700} style={{ borderRadius: '4px', top: 40 }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} size="small" style={{ marginTop: '-8px' }}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="name" label="Nama Item" rules={[{ required: true, message: "Masukkan nama item" }]}>
              <Input placeholder="Masukkan nama item" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="code" label="Kode Item" rules={[{ required: true, message: "Masukkan kode item" }, { pattern: /^[A-Z0-9-]+$/, message: "Kode harus huruf besar, angka, dan tanda hubung" }]}>
              <Input placeholder="Masukkan kode item (contoh: ITEM-0001)" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Deskripsi" rules={[{ required: true, message: "Masukkan deskripsi" }]} style={{ marginBottom: '16px' }}>
          <Input.TextArea rows={2} placeholder="Masukkan deskripsi item" />
        </Form.Item>

        <Row gutter={12}>
          <Col span={8}>
            <Form.Item name="price" label="Harga (Rp)" rules={[{ required: true, message: "Masukkan harga" }, { type: "number", min: 0, message: "Harga harus positif" }]}>
              <InputNumber style={{ width: "100%" }} placeholder="Masukkan harga" formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value!.replace(/Rp\s?|(,*)/g, "")} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bough_price" label="Harga Beli (Rp)" tooltip="Harga modal internal, tidak ditampilkan ke pelanggan" rules={[{ type: "number", min: 0, message: "Harga beli harus positif" }]}>
              <InputNumber style={{ width: "100%" }} placeholder="Masukkan harga beli (opsional)" formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value!.replace(/Rp\s?|(,*)/g, "")} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="price_cut" label="Potongan Harga (Rp)" rules={[{ type: "number", min: 0, message: "Potongan harga harus positif" }]}>
              <InputNumber style={{ width: "100%" }} placeholder="Masukkan potongan harga (opsional)" formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={(value) => value!.replace(/Rp\s?|(,*)/g, "")} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Form.Item name="rating" label="Rating (0.0 - 5.0)" rules={[{ type: "number", min: 0, max: 5, message: "Rating harus antara 0.0 dan 5.0" }]}>
              <InputNumber style={{ width: "100%" }} placeholder="Masukkan rating (0.0 - 5.0) - opsional" min={0} max={5} step={0.1} precision={1} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="weight" label="Berat (gram)" rules={[{ required: true, message: "Masukkan berat" }, { type: "number", min: 1, message: "Berat minimal 1 gram" }]}>
              <InputNumber style={{ width: "100%" }} placeholder="Masukkan berat dalam gram" min={1} step={1} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="points" label="Poin" rules={[{ type: "number", min: 0, message: "Poin harus positif" }]}>
              <InputNumber style={{ width: "100%" }} placeholder="Masukkan poin (opsional)" min={0} step={1} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="image" label="URL Gambar" rules={[{ required: true, message: "Masukkan URL gambar" }]}>
              <Input placeholder="Masukkan URL gambar" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="category_id" label="Kategori" style={{ marginBottom: '16px' }}>
          <Select
            placeholder="Pilih kategori (opsional)"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
          />
        </Form.Item>

        <Form.Item name="tags" label="Tag" rules={[{ required: true, message: "Masukkan minimal satu tag" }]} extra="Ketik satu kata tag dan tekan spasi untuk menambahkan" style={{ marginBottom: '16px' }}>
          <div style={{ border: "1px solid #d9d9d9", borderRadius: "4px", padding: "4px 8px", minHeight: "32px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px", background: "#fff", cursor: "text" }}>
            {tags.map((tag, index) => (
              <AntTag key={index} closable onClose={() => removeTag(index)} style={{ background: "#f0f0f0", border: "1px solid #d9d9d9", borderRadius: "4px", padding: "2px 8px", margin: "0", fontSize: "12px" }}>
                {tag}
              </AntTag>
            ))}
            <input
              type="text"
              placeholder={tags.length === 0 ? "Ketik satu kata tag dan tekan spasi untuk menambahkan" : ""}
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              style={{ border: "none", outline: "none", flex: 1, minWidth: "120px", fontSize: "14px", padding: "4px 0" }}
            />
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button onClick={onClose}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tambah Item
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddItemModal;
