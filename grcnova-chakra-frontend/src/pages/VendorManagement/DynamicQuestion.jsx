import React from "react";
import { Form, Input, Checkbox, Select } from "antd";

export default function DynamicQuestion({ question }) {
  const renderInput = () => {
    switch (question.type) {
      case "text":
        return <Input placeholder={question.placeholder} />;
      case "boolean":
        return <Checkbox>{question.label}</Checkbox>;
      case "select":
        return (
          <Select options={question.options} placeholder={question.placeholder} />
        );
      default:
        return <Input />;
    }
  };

  return (
    <Form.Item
      name={question.id}
      label={question.label}
      rules={[{ required: question.required }]}
    >
      {renderInput()}
    </Form.Item>
  );
}