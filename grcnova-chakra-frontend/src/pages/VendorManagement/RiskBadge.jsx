import React from "react";
import { Tag } from "antd";

export default function RiskBadge({ risk }) {
  const colorMap = {
    High: "red",
    Medium: "orange",
    Low: "green",
  };

  return <Tag color={colorMap[risk]}>{risk}</Tag>;
}