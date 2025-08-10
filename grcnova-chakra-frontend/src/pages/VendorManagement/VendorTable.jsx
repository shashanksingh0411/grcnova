import React from "react";
import { Table } from "antd";

export default function VendorTable({ data, loading, components }) {
  const columns = [
    {
      title: "Vendor Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Service Type",
      dataIndex: "serviceType",
      key: "serviceType",
    },
    {
      title: "Risk Level",
      dataIndex: "riskLevel",
      key: "riskLevel",
      render: (risk) => components.RiskBadge({ risk }),
    },
  ];

  return <Table columns={columns} dataSource={data} loading={loading} rowKey="id" />;
}