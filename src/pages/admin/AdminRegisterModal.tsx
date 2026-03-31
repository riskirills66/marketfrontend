import React, { useState } from "react";
import { Button, Form, Input, Modal, message } from "antd";

const AdminRegisterModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onRegister: (username: string, password: string) => Promise<void>;
}> = ({ visible, onClose, onRegister }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await onRegister(values.username, values.password);
      form.resetFields();
      onClose();
      message.success("Admin account created successfully!");
    } catch (error) {
      message.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Admin Account"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please enter username" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please enter password" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          rules={[{ required: true, message: "Please confirm password" }]}
        >
          <Input.Password placeholder="Confirm password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Create Admin Account
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminRegisterModal;


