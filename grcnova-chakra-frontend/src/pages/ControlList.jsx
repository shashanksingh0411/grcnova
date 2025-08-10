import React, { useState, useEffect } from 'react';
import { Table, Select, Button, Upload, Tag, Modal, Checkbox, Divider, Card } from 'antd';
import { SearchOutlined, UploadOutlined, DeleteOutlined, FilePdfOutlined } from '@ant-design/icons';

// Mock data for frameworks and controls
const frameworks = {
  ISO27001: [
    { id: 'A.5.1', control: 'Information security policies', category: 'Governance' },
    { id: 'A.6.2', control: 'Mobile device policy', category: 'Asset Management' },
    { id: 'A.12.4', control: 'Logging and monitoring', category: 'Operations Security' }
  ],
  NIST: [
    { id: 'AC-1', control: 'Access Control Policy', category: 'Access Control' },
    { id: 'SI-4', control: 'System Monitoring', category: 'System Integrity' }
  ],
  HIPAA: [
    { id: '164.308(a)(1)', control: 'Security Management Process', category: 'Administrative' },
    { id: '164.312(e)(1)', control: 'Transmission Security', category: 'Technical' }
  ],
  SOC2: [
    { id: 'CC1.1', control: 'Commitment to integrity', category: 'Common Criteria' },
    { id: 'CC6.1', control: 'Logical access controls', category: 'Common Criteria' }
  ]
};

export default function FrameworkControlsModule() {
  // State management
  const [selectedFrameworks, setSelectedFrameworks] = useState([]);
  const [controls, setControls] = useState([]);
  const [evidenceModal, setEvidenceModal] = useState({ visible: false, controlId: null });
  const [fileList, setFileList] = useState({});
  const [checkedControls, setCheckedControls] = useState([]);

  // Filter controls based on selected frameworks
  useEffect(() => {
    if (selectedFrameworks.length === 0) {
      setControls([]);
      return;
    }

    const mergedControls = selectedFrameworks.flatMap(framework => 
      frameworks[framework].map(control => ({
        ...control,
        framework,
        evidence: fileList[`${framework}-${control.id}`] || []
      }))
    );

    setControls(mergedControls);
  }, [selectedFrameworks, fileList]);

  // Handle file upload
  const handleUpload = (controlId, { fileList: newFileList }) => {
    setFileList(prev => ({
      ...prev,
      [controlId]: newFileList
    }));
  };

  // Handle file delete
  const handleDelete = (controlId, file) => {
    setFileList(prev => ({
      ...prev,
      [controlId]: prev[controlId].filter(f => f.uid !== file.uid)
    }));
  };

  // Toggle control selection
  const toggleControl = (controlId, checked) => {
    setCheckedControls(prev => 
      checked ? [...prev, controlId] : prev.filter(id => id !== controlId)
    );
  };

  // Toggle all controls
  const toggleAllControls = (checked) => {
    setCheckedControls(checked ? controls.map(c => `${c.framework}-${c.id}`) : []);
  };

  // Columns configuration
  const columns = [
    {
      title: <Checkbox 
        indeterminate={checkedControls.length > 0 && checkedControls.length < controls.length}
        checked={checkedControls.length === controls.length && controls.length > 0}
        onChange={e => toggleAllControls(e.target.checked)}
      />,
      dataIndex: 'id',
      render: (_, record) => (
        <Checkbox 
          checked={checkedControls.includes(`${record.framework}-${record.id}`)}
          onChange={e => toggleControl(`${record.framework}-${record.id}`, e.target.checked)}
        />
      ),
      width: 50
    },
    { 
      title: 'Framework', 
      dataIndex: 'framework', 
      render: framework => <Tag color={getFrameworkColor(framework)}>{framework}</Tag> 
    },
    { title: 'Control ID', dataIndex: 'id' },
    { title: 'Control', dataIndex: 'control' },
    { title: 'Category', dataIndex: 'category' },
    { 
      title: 'Evidence', 
      dataIndex: 'evidence',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<UploadOutlined />}
          onClick={() => setEvidenceModal({ visible: true, controlId: `${record.framework}-${record.id}` })}
        >
          {record.evidence?.length || 0} files
        </Button>
      ) 
    },
    { 
      title: 'Status', 
      dataIndex: 'status',
      render: (_, record) => (
        <Select 
          defaultValue="not_started" 
          style={{ width: 120 }}
          onChange={value => console.log(value)}
        >
          <Select.Option value="not_started">Not Started</Select.Option>
          <Select.Option value="in_progress">In Progress</Select.Option>
          <Select.Option value="completed">Completed</Select.Option>
        </Select>
      )
    }
  ];

  // Helper function for framework colors
  const getFrameworkColor = (framework) => {
    const colors = {
      ISO27001: 'blue',
      NIST: 'green',
      HIPAA: 'red',
      SOC2: 'purple'
    };
    return colors[framework] || 'gray';
  };

  return (
    <div className="framework-controls-module">
      <Card title="Compliance Framework Controls" bordered={false}>
        {/* Framework Selection */}
        <div style={{ marginBottom: 24 }}>
          <Select
            mode="multiple"
            placeholder="Select Frameworks"
            style={{ width: '100%' }}
            value={selectedFrameworks}
            onChange={setSelectedFrameworks}
            optionLabelProp="label"
          >
            {Object.keys(frameworks).map(framework => (
              <Select.Option key={framework} value={framework} label={framework}>
                <Tag color={getFrameworkColor(framework)}>{framework}</Tag>
                {framework}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Controls Table */}
        <Table
          columns={columns}
          dataSource={controls}
          rowKey={record => `${record.framework}-${record.id}`}
          bordered
          pagination={{ pageSize: 10 }}
        />

        {/* Evidence Modal */}
        <Modal
          title="Manage Evidence"
          visible={evidenceModal.visible}
          onCancel={() => setEvidenceModal({ visible: false, controlId: null })}
          footer={null}
          width={800}
        >
          {evidenceModal.controlId && (
            <div>
              <Upload
                multiple
                fileList={fileList[evidenceModal.controlId] || []}
                onChange={(info) => handleUpload(evidenceModal.controlId, info)}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Upload Evidence</Button>
              </Upload>

              <Divider />

              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {(fileList[evidenceModal.controlId] || []).map(file => (
                  <div key={file.uid} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div>
                      <FilePdfOutlined style={{ marginRight: 8 }} />
                      {file.name}
                    </div>
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDelete(evidenceModal.controlId, file)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>

        {/* Bulk Actions */}
        {checkedControls.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <span style={{ marginRight: 16 }}>
              {checkedControls.length} control(s) selected
            </span>
            <Button type="primary" style={{ marginRight: 8 }}>
              Bulk Update Status
            </Button>
            <Button>
              Export Selected
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}