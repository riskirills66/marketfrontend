import React, { useEffect, useState } from "react";
import { Badge, Button, Card, Col, DatePicker, Empty, Input, Row, Select, Spin, Typography, message, Tag as AntTag } from "antd";
import { Admin, PaginatedResponse, PurchaseSummary } from "../../../types";
import { apiClient } from "../../../api";
import dayjs from "dayjs";

const PurchaseTable: React.FC<{
  admin: Admin | null;
  onViewDetails: (purchase: PurchaseSummary) => void;
}> = ({ admin, onViewDetails }) => {
  const [purchases, setPurchases] = useState<PurchaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [codeFilter, setCodeFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const fetchPurchases = async (
    page: number = 1,
    status?: string,
    code?: string,
    startDate?: string,
    endDate?: string,
  ) => {
    if (!admin) return;

    setLoading(true);
    try {
      const data = await apiClient.getPurchases(
        page,
        20,
        status,
        code,
        startDate,
        endDate,
      );
      setPurchases(data.items);
      setTotalPurchases(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      message.error("Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchPurchases(
        currentPage,
        statusFilter || undefined,
        codeFilter || undefined,
        dateRange?.[0],
        dateRange?.[1],
      );
    }
  }, [admin, currentPage, statusFilter, codeFilter, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "green";
      case "pending":
        return "orange";
      default:
        return "default";
    }
  };

  if (!admin) {
    return <div>Please log in to view purchases</div>;
  }

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchPurchases(
      1,
      statusFilter || undefined,
      codeFilter || undefined,
      dateRange?.[0],
      dateRange?.[1],
    );
  };

  const handleClearFilters = () => {
    setStatusFilter("");
    setCodeFilter("");
    setDateRange(null);
    setCurrentPage(1);
  };

  return (
    <div>
      <style>
        {`
          @media (max-width: 768px) {
            .purchase-table-container {
              font-size: 10px;
            }
            .purchase-table-container th,
            .purchase-table-container td {
              padding: 2px 4px !important;
            }
            .purchase-table-container .ant-btn {
              font-size: 9px;
              padding: 1px 3px;
              height: 20px;
              min-width: 28px;
            }
            .purchase-table-container .ant-tag {
              font-size: 7px;
              padding: 0px 2px;
              margin: 0px;
            }
            .purchase-table-container .ant-badge {
              font-size: 8px;
            }
          }
        `}
      </style>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Typography.Text strong>Search by Code:</Typography.Text>
              <Input
                placeholder="Enter purchase code"
                value={codeFilter}
                onChange={(e) => setCodeFilter(e.target.value)}
                onPressEnter={handleFilterChange}
                style={{ marginTop: 4 }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Typography.Text strong>Status:</Typography.Text>
              <Select
                placeholder="All Status"
                style={{ width: "100%", marginTop: 4 }}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                <Select.Option value="">All Status</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="paid">Paid</Select.Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Typography.Text strong>Date Range:</Typography.Text>
              <DatePicker.RangePicker
                style={{ width: "100%", marginTop: 4 }}
                value={
                  dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null
                }
                onChange={(dates) => {
                  if (dates) {
                    setDateRange([
                      dates[0]?.format("YYYY-MM-DD") || "",
                      dates[1]?.format("YYYY-MM-DD") || "",
                    ]);
                  } else {
                    setDateRange(null);
                  }
                }}
                format="YYYY-MM-DD"
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
              <Button type="primary" onClick={handleFilterChange}>
                Apply Filters
              </Button>
              <Button onClick={handleClearFilters}>Clear All</Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card>
        <Spin spinning={loading}>
          {purchases.length === 0 ? (
            <Empty description="No purchases found" />
          ) : (
            <div className="purchase-table-container" style={{ 
              overflowX: "auto", 
              width: "100%", 
              minWidth: "100%",
              WebkitOverflowScrolling: "touch"
            }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse", 
                minWidth: "1200px",
                tableLayout: "fixed"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600", width: "15%", fontSize: "12px" }}>
                      Purchase Code
                    </th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600", width: "20%", fontSize: "12px" }}>
                      Customer
                    </th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600", width: "15%", fontSize: "12px" }}>
                      Phone
                    </th>
                    <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: "600", width: "12%", fontSize: "12px" }}>
                      Total
                    </th>
                    <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: "600", width: "8%", fontSize: "12px" }}>
                      Items
                    </th>
                    <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: "600", width: "10%", fontSize: "12px" }}>
                      Status
                    </th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600", width: "15%", fontSize: "12px" }}>
                      Date
                    </th>
                    <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: "600", width: "5%", fontSize: "12px" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ 
                        padding: "4px 6px", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        maxWidth: "0"
                      }}>
                        <Typography.Text code style={{ fontSize: "11px" }} title={purchase.code}>
                          {purchase.code}
                        </Typography.Text>
                      </td>
                      <td style={{ 
                        padding: "4px 6px", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        maxWidth: "0"
                      }}>
                        <Typography.Text strong style={{ fontSize: "12px" }} title={purchase.user_name}>
                          {purchase.user_name}
                        </Typography.Text>
                      </td>
                      <td style={{ 
                        padding: "4px 6px", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        maxWidth: "0"
                      }}>
                        <Typography.Text style={{ fontSize: "11px" }} title={purchase.user_phone}>
                          {purchase.user_phone}
                        </Typography.Text>
                      </td>
                      <td style={{ 
                        padding: "4px 6px", 
                        textAlign: "right", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        maxWidth: "0"
                      }}>
                        <Typography.Text strong style={{ fontSize: "12px", color: "#1890ff" }} title={formatCurrency(purchase.total_price)}>
                          {formatCurrency(purchase.total_price)}
                        </Typography.Text>
                      </td>
                      <td style={{ 
                        padding: "4px 6px", 
                        textAlign: "center",
                        maxWidth: "0",
                        whiteSpace: "nowrap"
                      }}>
                        <Badge count={purchase.items_count} showZero color="blue" style={{ fontSize: "10px" }} />
                      </td>
                      <td style={{ 
                        padding: "4px 6px", 
                        textAlign: "center",
                        maxWidth: "0",
                        whiteSpace: "nowrap"
                      }}>
                        <AntTag color={getStatusColor(purchase.status)} style={{ 
                          fontSize: "9px", 
                          padding: "0px 3px", 
                          margin: "0px",
                          borderRadius: "2px"
                        }}>
                          {purchase.status.toUpperCase()}
                        </AntTag>
                      </td>
                      <td style={{ 
                        padding: "4px 6px", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        maxWidth: "0"
                      }}>
                        <Typography.Text style={{ fontSize: "11px" }} title={formatDate(purchase.created_at)}>
                          {formatDate(purchase.created_at)}
                        </Typography.Text>
                      </td>
                      <td style={{ 
                        padding: "4px 6px", 
                        textAlign: "center",
                        maxWidth: "0",
                        whiteSpace: "nowrap"
                      }}>
                        <Button type="primary" size="small" onClick={() => onViewDetails(purchase)} style={{ fontSize: "10px" }}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Spin>

        {purchases.length > 0 && (
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", padding: "16px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                Previous
              </Button>
              <span style={{ padding: "0 16px", fontSize: "14px" }}>
                Page {currentPage} of {Math.ceil(totalPurchases / 20)}
              </span>
              <Button disabled={!hasMore} onClick={() => setCurrentPage(currentPage + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PurchaseTable;


