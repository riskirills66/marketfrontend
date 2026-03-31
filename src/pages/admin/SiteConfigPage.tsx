import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Typography, ColorPicker, Row, Col, Divider } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { apiClient } from '../../api';
import type { SiteConfig, UpdateSiteConfigRequest } from '../../types';

const { Title, Text } = Typography;

export default function SiteConfigPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await apiClient.getSiteConfig();
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

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Check if admin is logged in
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) {
        message.error('You must be logged in as admin to update configuration');
        setLoading(false);
        return;
      }

      const updateData: UpdateSiteConfigRequest = {};
      
      // Convert Color objects to hex strings
      Object.keys(values).forEach(key => {
        const value = values[key];
        if (value && typeof value === 'object' && 'toHexString' in value) {
          updateData[key as keyof UpdateSiteConfigRequest] = value.toHexString();
        } else if (value) {
          updateData[key as keyof UpdateSiteConfigRequest] = value;
        }
      });

      await apiClient.updateAdminSiteConfig(updateData);
      message.success('Configuration updated! Refresh the page to see changes.');
      loadConfig();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        message.error('Session expired. Please login again.');
      } else {
        message.error('Failed to update configuration');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const ColorFormItem = ({ label, name, description }: { label: string; name: string; description?: string }) => (
    <Form.Item
      label={label}
      name={name}
      extra={description}
      getValueFromEvent={(color: Color) => color?.toHexString()}
      getValueProps={(value) => ({ value })}
    >
      <ColorPicker
        showText
        format="hex"
        size="large"
        presets={[
          {
            label: 'Recommended',
            colors: [
              '#0ea5e9', '#06b6d4', '#8b5cf6', '#f59e0b',
              '#10b981', '#ef4444', '#f97316', '#84cc16',
              '#ec4899', '#6366f1', '#14b8a6', '#f43f5e',
              '#1a1a1a', '#64748b', '#fafbfc', '#ffffff',
            ],
          },
        ]}
      />
    </Form.Item>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🎨 Site Configuration</Title>
      <Text type="secondary">
        Customize your site's theme colors and favicon. Changes take effect after refreshing the page.
      </Text>

      <Card style={{ marginTop: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Title level={4}>🎯 Brand Colors</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            Main colors that define your brand identity
          </Text>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Primary Color" 
                name="primary_color"
                description="Main brand color used for buttons and highlights"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Secondary Color" 
                name="secondary_color"
                description="Supporting brand color"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Accent Color" 
                name="accent_color"
                description="Accent color for special elements"
              />
            </Col>
          </Row>

          <Divider />
          <Title level={4}>✨ Semantic Colors</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            Colors that convey meaning and status
          </Text>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Promo Color" 
                name="promo_color"
                description="Used for promotional badges and offers"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Success Color" 
                name="success_color"
                description="Indicates successful actions"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Warning Color" 
                name="warning_color"
                description="Indicates warnings or caution"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Error Color" 
                name="error_color"
                description="Indicates errors or problems"
              />
            </Col>
          </Row>

          <Divider />
          <Title level={4}>📝 Text & Background Colors</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            Colors for text and background elements
          </Text>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Text Primary" 
                name="text_primary"
                description="Main text color"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Text Secondary" 
                name="text_secondary"
                description="Secondary text color"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Background Color" 
                name="background_color"
                description="Page background color"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Surface Color" 
                name="surface_color"
                description="Card and surface background"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <ColorFormItem 
                label="Border Color" 
                name="border_color"
                description="Border and divider color"
              />
            </Col>
          </Row>

          <Divider />
          <Title level={4}>🔖 Favicon</Title>
          <Form.Item
            label="Favicon URL"
            name="favicon_url"
            rules={[{ required: true, message: 'Favicon URL is required' }]}
            extra="Enter a relative path (e.g., /favicon.svg) or full URL (e.g., https://example.com/favicon.ico)"
          >
            <Input 
              placeholder="/favicon.svg or https://example.com/favicon.ico" 
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '32px' }}>
            <Space size="large">
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                💾 Save Configuration
              </Button>
              <Button onClick={loadConfig} size="large">
                🔄 Reset to Current
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
