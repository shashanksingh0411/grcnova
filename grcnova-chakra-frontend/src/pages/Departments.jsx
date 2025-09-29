// src/pages/Departments.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  useDisclosure,
  Textarea,
  Text,
} from "@chakra-ui/react";
import { supabase } from "../supabase"; // adjust if path differs

const Departments = ({ currentUser }) => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Department state
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Task state
  const [openDeptId, setOpenDeptId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [assignTaskId, setAssignTaskId] = useState(null);
  const [assignUserId, setAssignUserId] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure(); // add dept modal
  const {
    isOpen: isTaskOpen,
    onOpen: onTaskOpen,
    onClose: onTaskClose,
  } = useDisclosure(); // add task modal
  const {
    isOpen: isAssignOpen,
    onOpen: onAssignOpen,
    onClose: onAssignClose,
  } = useDisclosure(); // assign task modal

  const toast = useToast();

  // Fetch departments + owners
  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("id, name, description, owner_id, profiles:owner_id(full_name,email), created_at");
    if (!error) setDepartments(data || []);
  };

  // Fetch users
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, department_id");
    if (!error) setUsers(data || []);
  };

  // Fetch tasks
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, description, status, priority, department_id");
    if (!error) setTasks(data || []);
  };

  // Create Department
  const createDepartment = async () => {
    if (!newDeptName) return;
    const { error } = await supabase.from("departments").insert([
      { name: newDeptName, description: newDeptDesc || null },
    ]);
    if (error) {
      toast({ title: "Error creating department", status: "error" });
    } else {
      toast({ title: "Department created", status: "success" });
      setNewDeptName("");
      setNewDeptDesc("");
      fetchDepartments();
      onClose();
    }
  };

  // Assign user to department
  const assignUser = async () => {
    if (!selectedDept || !selectedUser) return;
    const { error } = await supabase
      .from("profiles")
      .update({ department_id: selectedDept })
      .eq("id", selectedUser);
    if (error) {
      toast({ title: "Error assigning user", status: "error" });
    } else {
      toast({ title: "User assigned", status: "success" });
      fetchDepartments();
      fetchUsers();
    }
  };

  // Create task for department
  const createTask = async () => {
    if (!newTaskTitle || !openDeptId) return;
    const { error } = await supabase.from("tasks").insert([
      {
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        status: "pending",
        department_id: openDeptId,
        organization_id: currentUser.organization_id, // required
      },
    ]);
    if (error) {
      toast({ title: "Error creating task", status: "error" });
    } else {
      toast({ title: "Task created", status: "success" });
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskPriority("medium");
      fetchTasks();
      onTaskClose();
    }
  };

  // Assign task internally
  const assignTaskInternally = async () => {
    if (!assignTaskId || !assignUserId) return;
    const { error } = await supabase.from("department_task_assignments").insert([
      {
        task_id: assignTaskId,
        assigned_to: assignUserId,
        assigned_by: currentUser.id,
      },
    ]);
    if (error) {
      toast({ title: "Error assigning task internally", status: "error" });
    } else {
      toast({ title: "Task assigned internally", status: "success" });
      setAssignTaskId(null);
      setAssignUserId(null);
      onAssignClose();
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDepartments(), fetchUsers(), fetchTasks()]).then(() =>
      setLoading(false)
    );
  }, []);

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>
        Departments
      </Heading>

      <Button colorScheme="purple" onClick={onOpen} mb={4}>
        + Add Department
      </Button>

      {loading ? (
        <Spinner />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Owner</Th>
              <Th>Created At</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {departments.map((dept) => (
              <Tr key={dept.id}>
                <Td>{dept.name}</Td>
                <Td>{dept.description}</Td>
                <Td>
                  {dept.profiles?.full_name || "—"} <br />
                  <small>{dept.profiles?.email}</small>
                </Td>
                <Td>{new Date(dept.created_at).toLocaleDateString()}</Td>
                <Td>
                  <Button
                    size="sm"
                    onClick={() =>
                      setOpenDeptId(openDeptId === dept.id ? null : dept.id)
                    }
                  >
                    {openDeptId === dept.id ? "Hide Tasks" : "View Tasks"}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Department Task Section */}
      {openDeptId && (
        <Box mt={6} p={4} border="1px solid #ddd" rounded="md">
          <Heading size="md" mb={2}>
            Tasks for{" "}
            {departments.find((d) => d.id === openDeptId)?.name || "Department"}
          </Heading>

          {tasks
            .filter((t) => t.department_id === openDeptId)
            .map((task) => (
              <Box
                key={task.id}
                p={3}
                mb={2}
                border="1px solid #eee"
                rounded="md"
              >
                <Text fontWeight="bold">{task.title}</Text>
                <Text fontSize="sm" color="gray.600">
                  {task.description}
                </Text>
                <Text>
                  Status: {task.status} | Priority: {task.priority}
                </Text>
                {currentUser.id ===
                  departments.find((d) => d.id === openDeptId)?.owner_id && (
                  <Button
                    size="xs"
                    mt={2}
                    onClick={() => {
                      setAssignTaskId(task.id);
                      onAssignOpen();
                    }}
                  >
                    Assign Internally
                  </Button>
                )}
              </Box>
            ))}

          <Button size="sm" colorScheme="blue" onClick={onTaskOpen}>
            + Add Task
          </Button>
        </Box>
      )}

      {/* Add Department Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Department</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Department Name"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              mb={3}
            />
            <Input
              placeholder="Description"
              value={newDeptDesc}
              onChange={(e) => setNewDeptDesc(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={createDepartment}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={isTaskOpen} onClose={onTaskClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Task</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Task Title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              mb={3}
            />
            <Textarea
              placeholder="Task Description"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              mb={3}
            />
            <Select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onTaskClose} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={createTask}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assign Task Modal */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Task to User</ModalHeader>
          <ModalBody>
            <Select
              placeholder="Select User"
              value={assignUserId || ""}
              onChange={(e) => setAssignUserId(e.target.value)}
            >
              {users
                .filter((u) => u.department_id === openDeptId)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onAssignClose} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={assignTaskInternally}>
              Assign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Departments;
