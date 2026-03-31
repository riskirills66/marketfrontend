import React, { useEffect, useState } from "react";
import { Modal, Spin, Card, Typography, Row, Col, Table, Tag as AntTag, Empty, message, Button } from "antd";
import { Admin, ItemWithQuantity, PurchaseDetails, PurchaseSummary } from "../../../types";
import { apiClient } from "../../../api";
import { FileTextOutlined } from "@ant-design/icons";

const PurchaseDetailsModal: React.FC<{
  visible: boolean;
  purchase: PurchaseSummary | null;
  admin: Admin | null;
  onClose: () => void;
}> = ({ visible, purchase, admin, onClose }) => {
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPurchaseDetails = async () => {
    if (!purchase || !admin) return;
    setLoading(true);
    try {
      const details = await apiClient.checkPurchase(
        purchase.code,
        "admin_view",
      );
      setPurchaseDetails(details);
    } catch (error) {
      message.error("Failed to fetch purchase details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && purchase) {
      fetchPurchaseDetails();
    }
  }, [visible, purchase]);

  const toNumber = (value: any) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") {
      const cleaned = value.replace(/[^0-9.-]/g, "");
      const n = parseFloat(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const formatCurrency = (amount: number) => {
    const safeAmount = toNumber(amount);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(safeAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalPoints = () => {
    if (!purchaseDetails) return 0;
    try {
      return purchaseDetails.items.reduce((sum, rec) => {
        const pts = toNumber((rec as any).item?.points ?? 0);
        const qty = toNumber(rec.quantity as any);
        return sum + pts * qty;
      }, 0);
    } catch {
      return 0;
    }
  };

  const handleCancelPurchase = async () => {
    if (!purchase || !purchaseDetails) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.cancelPurchase(purchase.code);
      message.success("Purchase cancelled successfully");
      await fetchPurchaseDetails();
    } catch (error) {
      message.error("Failed to cancel purchase");
    } finally {
      setLoading(false);
    }
  };

  const canCancel = purchaseDetails && purchaseDetails.status !== "cancel";

  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';
  const receiptUrl = purchase 
    ? `${API_BASE_URL}/order/${purchase.code}`
    : '#';

  return (
    <Modal
      title={`Purchase Details - ${purchase?.code}`}
      open={visible}
      onCancel={onClose}
      zIndex={1000}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <a key="receipt-link" href={receiptUrl} target="_blank" rel="noopener noreferrer">
          <Button 
            icon={<FileTextOutlined />}
          >
            View Receipt
          </Button>
        </a>,
        canCancel ? (
          <Button 
            key="cancel" 
            danger 
            onClick={handleCancelPurchase} 
            loading={loading}
          >
            Cancel Purchase
          </Button>
        ) : null,
      ].filter(Boolean)}
      width={800}
    >
      <Spin spinning={loading}>
        {purchaseDetails ? (
          <div>
            <Card style={{ marginBottom: "4px" }} bodyStyle={{ padding: "12px" }}>
              <Typography.Title level={5} style={{ marginBottom: "8px" }}>Customer Information</Typography.Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Typography.Text strong>Name:</Typography.Text>
                  <br />
                  <Typography.Text>{purchaseDetails.user.name}</Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text strong>Phone:</Typography.Text>
                  <br />
                  <Typography.Text>{purchaseDetails.user.phone}</Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text strong>Status:</Typography.Text>
                  <br />
                  <AntTag color={
                    purchaseDetails.status === "paid" ? "green" :
                    purchaseDetails.status === "cancel" ? "red" :
                    "orange"
                  }>
                    {purchaseDetails.status.toUpperCase()}
                  </AntTag>
                </Col>
              </Row>
              <Row style={{ marginTop: "4px" }}>
                <Col span={24}>
                  <Typography.Text strong>Address:</Typography.Text>
                  <br />
                  <Typography.Text>{purchaseDetails.user.address}</Typography.Text>
                </Col>
              </Row>
            </Card>

            <Card style={{ marginBottom: "4px" }} bodyStyle={{ padding: "12px" }}>
              <Typography.Title level={5} style={{ marginBottom: "8px" }}>Order Items</Typography.Title>
              <Table
                dataSource={purchaseDetails.items}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Item",
                    key: "item",
                    render: (_, record: ItemWithQuantity) => (
                      <div>
                        <Typography.Text strong>{record.item.name}</Typography.Text>
                        <br />
                        <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                          Code: {record.item.code}
                        </Typography.Text>
                      </div>
                    ),
                  },
                  {
                    title: "Price",
                    key: "price",
                    width: 120,
                    render: (_, record: ItemWithQuantity) => {
                      const price = toNumber(record.item.price);
                      const priceCut = toNumber(record.item.price_cut);
                      const finalPrice = Math.max(0, price - priceCut);
                      
                      return (
                        <div>
                          <Typography.Text>
                            {formatCurrency(finalPrice)}
                          </Typography.Text>
                          {priceCut > 0 && (
                            <>
                              <br />
                              <Typography.Text type="success" style={{ fontSize: "11px" }}>
                                -{formatCurrency(priceCut)}
                              </Typography.Text>
                            </>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    title: "Qty",
                    dataIndex: "quantity",
                    key: "quantity",
                    width: 60,
                    align: "center" as const,
                    render: (quantity: number) => (
                      <Typography.Text strong>{quantity}</Typography.Text>
                    ),
                  },
                  {
                    title: "Total",
                    key: "total",
                    width: 120,
                    align: "right" as const,
                    render: (_, record: ItemWithQuantity) => {
                      const price = toNumber(record.item.price);
                      const priceCut = toNumber(record.item.price_cut);
                      const finalPrice = Math.max(0, price - priceCut);
                      const total = finalPrice * toNumber(record.quantity);
                      
                      return (
                        <Typography.Text strong>
                          {formatCurrency(total)}
                        </Typography.Text>
                      );
                    },
                  },
                ]}
              />
            </Card>

            <Card bodyStyle={{ padding: "12px" }}>
              <Typography.Title level={5} style={{ marginBottom: '8px' }}>Order Summary</Typography.Title>
              
              {/* Shipping Information */}
              {(purchaseDetails.shipping_destination || purchaseDetails.shipping_expedition) && (
                <div style={{ marginBottom: '8px', padding: '8px', background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '6px' }}>
                  <Typography.Text strong style={{ color: '#0369a1', display: 'block', marginBottom: '4px' }}>
                    📦 Shipping Information
                  </Typography.Text>
                  {purchaseDetails.shipping_destination && (
                    <div style={{ marginBottom: '2px' }}>
                      <Typography.Text strong style={{ color: '#374151' }}>Destination: </Typography.Text>
                      <Typography.Text style={{ color: '#6b7280' }}>{purchaseDetails.shipping_destination}</Typography.Text>
                    </div>
                  )}
                  {purchaseDetails.shipping_expedition && (
                    <div>
                      <Typography.Text strong style={{ color: '#374151' }}>Courier: </Typography.Text>
                      <Typography.Text style={{ color: '#6b7280' }}>{purchaseDetails.shipping_expedition}</Typography.Text>
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Typography.Text>Subtotal</Typography.Text>
                  <Typography.Text>
                    {formatCurrency(
                      toNumber(purchaseDetails.total_price) - toNumber(purchaseDetails.shipping_cost || 0)
                    )}
                  </Typography.Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Typography.Text>Total Points</Typography.Text>
                  <Typography.Text strong style={{ color: '#16a34a' }}>
                    {getTotalPoints().toLocaleString('id-ID')}
                  </Typography.Text>
                </div>
                
                {toNumber(purchaseDetails.shipping_cost || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Typography.Text>Shipping Cost</Typography.Text>
                    <Typography.Text>
                      {formatCurrency(toNumber(purchaseDetails.shipping_cost || 0))}
                    </Typography.Text>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography.Title level={4} style={{ margin: 0, color: '#1f2937' }}>Total</Typography.Title>
                    <Typography.Title level={4} style={{ margin: 0, color: '#1f2937' }}>
                      {formatCurrency(toNumber(purchaseDetails.total_price))}
                    </Typography.Title>
                  </div>
                </div>
              </div>

              {/* Order Date */}
              <div style={{ marginTop: '8px', textAlign: 'right' }}>
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  Order Date: {formatDate(purchaseDetails.created_at)}
                </Typography.Text>
              </div>
            </Card>
          </div>
        ) : (
          <Empty description="No purchase details available" />
        )}
      </Spin>
    </Modal>
  );
};

export default PurchaseDetailsModal;


