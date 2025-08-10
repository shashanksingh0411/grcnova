import React, { useState, useEffect } from 'react';
import { Table, Select, Button, DatePicker, Upload, Modal, Tag } from 'antd';
import { SearchOutlined, ScheduleOutlined, UploadOutlined } from '@ant-design/icons';

// Mock data for Control Library
const controlsData = [
  { id: 1, name: 'Encryption at Rest', framework: 'ISO27001', type: 'Automated', description: 'Ensure all data is encrypted at rest' },
  { id: 2, name: 'Access Reviews', framework: 'SOC2', type: 'Manual', description: 'Quarterly user access reviews' },
  { id: 3, name: 'Penetration Testing', framework: 'PCI DSS', type: 'Automated', description: 'Annual external pen tests' },
];

// Mock data for Test Scheduler
const scheduledTests = [
  { id: 1, controlId: 3, name: 'Q3 Pen Test', frequency: 'Quarterly', assignee: 'Security Team', dueDate: '2023-11-30' },
];

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function ControlsAndTestsModule() {
  // State for Control Library
  const [filteredControls, setFilteredControls] = useState(controlsData);
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // State for Test Scheduler
  const [newTest, setNewTest] = useState({
    controlId: '',
    frequency: '',
    assignee: '',
    dueDate: null
  });

  // State for Test Results
  const [activeTest, setActiveTest] = useState(null);
  const [resultStatus, setResultStatus] = useState('');
  const [fileList, setFileList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Filter controls based on selections
  useEffect(() => {
    let filtered = controlsData;
    if (frameworkFilter) {
      filtered = filtered.filter(control => control.framework === frameworkFilter);
    }
    if (typeFilter) {
      filtered = filtered.filter(control => control.type === typeFilter);
    }
    setFilteredControls(filtered);
  }, [frameworkFilter, typeFilter]);

  // Handle test scheduling
  const scheduleTest = () => {
    console.log('Scheduled test:', newTest);
    // API call would go here
    setNewTest({ controlId: '', frequency: '', assignee: '', dueDate: null });
  };

  // Handle test result submission
  const submitTestResult = () => {
    console.log('Test result:', { 
      testId: activeTest.id, 
      status: resultStatus, 
      attachments: fileList 
    });
    setIsModalVisible(false);
    // API call would go here
  };

  // Columns for Control Library table
  const controlColumns = [
    { title: 'Control Name', dataIndex: 'name', key: 'name' },
    { title: 'Framework', dataIndex: 'framework', key: 'framework' },
    { title: 'Type', dataIndex: 'type', key: 'type', 
      render: type => <Tag color={type === 'Automated' ? 'green' : 'orange'}>{type}</Tag> },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Action', key: 'action', 
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<ScheduleOutlined />} 
          onClick={() => setNewTest({...newTest, controlId: record.id})}
        >
          Schedule Test
        </Button>
      ) 
    },
  ];

  // Columns for Scheduled Tests table
  const testColumns = [
    { title: 'Test Name', dataIndex: 'name', key: 'name' },
    { title: 'Control', dataIndex: 'controlId', key: 'controlId', 
      render: id => controlsData.find(c => c.id === id)?.name },
    { title: 'Frequency', dataIndex: 'frequency', key: 'frequency' },
    { title: 'Assignee', dataIndex: 'assignee', key: 'assignee' },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
    { title: 'Action', key: 'action', 
      render: (_, record) => (
        <Button type="primary" onClick={() => { setActiveTest(record); setIsModalVisible(true); }}>
          Submit Results
        </Button>
      ) 
    },
  ];

  return (
    <div className="controls-tests-module">
      {/* Control Library Section */}
      <section>
        <h2>Control Library</h2>
        <div className="filters" style={{ marginBottom: 16 }}>
          <Select
            placeholder="Filter by Framework"
            style={{ width: 200, marginRight: 8 }}
            onChange={setFrameworkFilter}
            allowClear
          >
            <Option value="ISO27001">ISO 27001</Option>
            <Option value="SOC2">SOC 2</Option>
            <Option value="PCI DSS">PCI DSS</Option>
          </Select>
          <Select
            placeholder="Filter by Type"
            style={{ width: 200 }}
            onChange={setTypeFilter}
            allowClear
          >
            <Option value="Automated">Automated</Option>
            <Option value="Manual">Manual</Option>
          </Select>
        </div>
        <Table 
          columns={controlColumns} 
          dataSource={filteredControls} 
          rowKey="id" 
          size="small" 
        />
      </section>

      {/* Test Scheduler Section */}
      <section style={{ marginTop: 32 }}>
        <h2>Test Scheduler</h2>
        <div className="scheduler-form" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Select
            placeholder="Select Control"
            style={{ width: 200 }}
            value={newTest.controlId}
            onChange={val => setNewTest({...newTest, controlId: val})}
          >
            {controlsData.map(control => (
              <Option key={control.id} value={control.id}>{control.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="Frequency"
            style={{ width: 150 }}
            value={newTest.frequency}
            onChange={val => setNewTest({...newTest, frequency: val})}
          >
            <Option value="Monthly">Monthly</Option>
            <Option value="Quarterly">Quarterly</Option>
            <Option value="Annual">Annual</Option>
          </Select>
          <Select
            placeholder="Assignee"
            style={{ width: 150 }}
            value={newTest.assignee}
            onChange={val => setNewTest({...newTest, assignee: val})}
          >
            <Option value="Security Team">Security Team</Option>
            <Option value="Compliance Team">Compliance Team</Option>
            <Option value="External Auditor">External Auditor</Option>
          </Select>
          <DatePicker 
            placeholder="Due Date" 
            value={newTest.dueDate}
            onChange={date => setNewTest({...newTest, dueDate: date})}
          />
          <Button type="primary" onClick={scheduleTest}>Schedule</Button>
        </div>
        <Table 
          columns={testColumns} 
          dataSource={scheduledTests} 
          rowKey="id" 
          size="small" 
        />
      </section>

      {/* Test Results Modal */}
      <Modal 
        title={`Submit Results for ${activeTest?.name || 'Test'}`}
        visible={isModalVisible}
        onOk={submitTestResult}
        onCancel={() => setIsModalVisible(false)}
      >
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="Select Result"
            style={{ width: '100%' }}
            value={resultStatus}
            onChange={setResultStatus}
          >
            <Option value="Pass">Pass</Option>
            <Option value="Fail">Fail</Option>
            <Option value="Partial">Partial</Option>
          </Select>
        </div>
        <Upload
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false} // Prevent auto-upload
          multiple
        >
          <Button icon={<UploadOutlined />}>Upload Evidence (Screenshots/PDFs)</Button>
        </Upload>
      </Modal>
    </div>
  );
}