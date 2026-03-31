import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Typography } from 'antd';
import { apiClient } from '../../api';
import type { SiteConfig, UpdateSiteConfigRequest } from '../../types';

const { Title, Text } = Typography;

export default function SiteConfigPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await apiClient.getSiteConfig();
      setConfig(data);
      form.setFieldsValue({
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        accent_color: data.accent_color,
        promo_color: data.promo_color,
        success_color: data.success_color,
        warning_color: data.warning_color,
        error_color: data.error_color,
        text_primary: data.text_primary,
        text_secondary: data.text_secondary,
        background_color: data.background_color,
        surface_color: data.surface_color,
        border_color: data.border_color,
        favicon_url: data.favicon_url,
      });
    } catch (error) {
      message.error('Failed to load configuration');
      console.error(error);
    }
  };

  const handleSubmit = async (values: UpdateSiteConfigRequest) => {
    setLoading(true);
    try {
      await apiClient.updateAdminSiteConfig(values);
      message.success('Configuration updated successfully! Refresh the page to see changes.');
      loadConfig();
    } catch (error) {
      message.error('Failed to update configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Site Configuration</Title>
      <Text type="secondary">
        Configure theme colors and favicon. Changes will be applied on next page load.
      </Text>

      <Card style={{ marginTop: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Title level={4}>Brand Colors</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Form.Item
              label="Primary Color"
              name="primary_color"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color (e.g., #0ea5e9)' }]}
            >
              <Input placeholder="#0ea5e9" />
            </Form.Item>

            <Form.Item
              label="Secondary Color"
              name="secondary_color"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color' }]}
            >
              <Input placeholder="#06b6d4" />
            </Form.Item>

            <Form.Item
              label="Accent Color"
              name="accent_color"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color' }]}
            >
              <Input placeholder="#8b5cf6" />
            </Form.Item>

            <Title level={4} style={{ marginTop: '24px' }}>Semantic Colors</Title>

            <Form.Item
              label="Promo Color"
              name="promo_color"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color' }]}
            >
              <Input placeholder="#ff4757" />
            </Form.Item>

            <Form.Item
              label="Success Color"
              name="success_color"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color' }]}
            >
              <Input placeholder="#52c41a" />
            </Form.Item>

            <Form.Item
              label="Warning Color"
              name="warning_color"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color' }]}
            >
              <Input placeholder="#faad14" />
            </Form.Item>

            <Form.Item
              label="Error Color"
              name="error_color"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color' }]}
            >
              <Input placeholder="#ff4d4f" />
            </Form.Item>

            <Title level={4} style={{ marginTop: '24px' }}>Text & Background Colors</Title>

            <Form.Item
              label="Text Primary"
              name="text_primary"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color' }]}
            >
              <Input placeholder="#1a1a1a" />
            </Form.Item>

            <Form.Item
              label="Text Secondary"
              name="text_secondary"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color' }]}
            >
              <Input placeholder="#64748b" />
            </Form.Item>

            <Form.Item
              label="Background Color"
              name="background_color"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color' }]}
            >
              <Input placeholder="#fafbfc" />
            </Form.Item>

            <Form.Item
              label="Surface Color"
              name="surface_color"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color' }]}
            >
              <Input placeholder="#ffffff" />
            </Form.Item>

            <Form.Item
              label="Border Color"
              name="border_color"
              rules={[{ pattern: /^#[0-9A-Fa-f]{6}$/, message: 'Must be a valid hex color' }]}
            >
              <Input placeholder="#e1e8ed" />
            </Form.Item>

            <Title level={4} style={{ marginTop: '24px' }}>Favicon</Title>

            <Form.Item
              label="Favicon URL"
              name="favicon_url"
              rules={[{ required: true, message: 'Favicon URL is required' }]}
            >
              <Input placeholder="/favicon.svg or https://example.com/favicon.ico" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Save Configuration
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
