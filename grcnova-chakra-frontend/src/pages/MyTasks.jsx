// src/pages/MyTasks.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Heading, Spinner, Text, SimpleGrid, Card, CardHeader, CardBody, CardFooter,
  Badge, Select, Button, useToast, HStack, VStack, Collapse, Input, IconButton, Link
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { supabase } from "../supabase";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const MyTasks = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [departmentsMap, setDepartmentsMap] = useState({});
  const [assignedByMap, setAssignedByMap] = useState({});
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedTaskIds, setExpandedTaskIds] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [newComments, setNewComments] = useState({});
  const [editCommentMap, setEditCommentMap] = useState({});
  const [editCommentText, setEditCommentText] = useState({});
  const [attachmentsMap, setAttachmentsMap] = useState({});
  const [editAttachmentMap, setEditAttachmentMap] = useState({});
  const [editAttachmentText, setEditAttachmentText] = useState({});

  const toast = useToast();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        toast({ title: "Auth error", description: userErr?.message || "No user", status: "error" });
        setLoading(false);
        return;
      }
      if (!mounted) return;
      setCurrentUser(user);

      const { data: tasksData, error: tasksErr } = await supabase
        .from("tasks")
        .select("*")
        .contains("assigned_to", [user.id])
        .order("created_at", { ascending: false });
      if (tasksErr) { toast({ title: "Error fetching tasks", description: tasksErr.message, status: "error" }); setLoading(false); return; }
      if (!mounted) return;
      setTasks(tasksData || []);

      const deptIds = [...new Set((tasksData || []).map((t) => t.department_id).filter(Boolean))];
      if (deptIds.length) {
        const { data: deptsData } = await supabase.from("departments").select("id, name").in("id", deptIds);
        const deptsById = (deptsData || []).reduce((acc, d) => { acc[d.id] = d; return acc; }, {});
        setDepartmentsMap(deptsById);
      }

      const assignedByIds = [...new Set((tasksData || []).map((t) => t.created_by).filter(Boolean))];
      if (assignedByIds.length) {
        const { data: usersData } = await supabase.from("profiles").select("id, full_name").in("id", assignedByIds);
        const usersMap = (usersData || []).reduce((acc, u) => { acc[u.id] = u.full_name; return acc; }, {});
        setAssignedByMap(usersMap);
      }

      if (tasksData?.length) {
        const { data: commentsData } = await supabase.from("task_comments").select("*").in("task_id", tasksData.map(t => t.id));
        const commentsByTask = {};
        (commentsData || []).forEach(c => { if (!commentsByTask[c.task_id]) commentsByTask[c.task_id] = []; commentsByTask[c.task_id].push(c); });
        setCommentsMap(commentsByTask);

        const { data: attachData } = await supabase.from("task_attachments").select("*").in("task_id", tasksData.map(t => t.id));
        const attachByTask = {};
        (attachData || []).forEach(a => { if (!attachByTask[a.task_id]) attachByTask[a.task_id] = []; attachByTask[a.task_id].push(a); });
        setAttachmentsMap(attachByTask);
      }

      setLoading(false);
    };

    fetchData();
    return () => { mounted = false; };
  }, [toast]);

  const updateTaskStatus = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    if (error) toast({ title: "Update failed", description: error.message, status: "error" });
    else toast({ title: "Status updated", status: "success", duration: 1500 });
  };

  const toggleExpand = (taskId) => setExpandedTaskIds(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);

  // Comments
  const handleAddComment = async (taskId) => {
    const commentText = newComments[taskId]?.trim();
    if (!commentText) return;
    const { data, error } = await supabase.from("task_comments").insert([{ task_id: taskId, user_id: currentUser.id, comment: commentText }]);
    if (error) toast({ title: "Failed to add comment", description: error.message, status: "error" });
    else {
      setCommentsMap(prev => ({ ...prev, [taskId]: [...(prev[taskId] || []), data[0]] }));
      setNewComments(prev => ({ ...prev, [taskId]: "" }));
    }
  };

  const handleEditComment = (commentId, currentText) => { setEditCommentMap(prev => ({ ...prev, [commentId]: true })); setEditCommentText(prev => ({ ...prev, [commentId]: currentText })); };
  const saveEditComment = async (commentId, taskId) => {
    const newText = editCommentText[commentId]?.trim(); if (!newText) return;
    const { error } = await supabase.from("task_comments").update({ comment: newText }).eq("id", commentId);
    if (error) toast({ title: "Update failed", description: error.message, status: "error" });
    else {
      setCommentsMap(prev => ({ ...prev, [taskId]: prev[taskId].map(c => c.id === commentId ? { ...c, comment: newText } : c) }));
      setEditCommentMap(prev => { const copy = { ...prev }; delete copy[commentId]; return copy; });
      setEditCommentText(prev => { const copy = { ...prev }; delete copy[commentId]; return copy; });
    }
  };

  const deleteComment = async (commentId, taskId) => {
    const { error } = await supabase.from("task_comments").delete().eq("id", commentId);
    if (error) toast({ title: "Delete failed", description: error.message, status: "error" });
    else setCommentsMap(prev => ({ ...prev, [taskId]: prev[taskId].filter(c => c.id !== commentId) }));
  };

  // Attachments
  const handleFileUpload = async (taskId, event) => {
    const file = event.target.files[0]; if (!file) return;
    const fileExt = file.name.split(".").pop();
    const filePath = `task_attachments/${taskId}/${Date.now()}.${fileExt}`;
    const { error: uploadErr } = await supabase.storage.from("task-files").upload(filePath, file);
    if (uploadErr) return toast({ title: "Upload failed", description: uploadErr.message, status: "error" });
    const { publicURL } = supabase.storage.from("task-files").getPublicUrl(filePath);
    const { data, error: insertErr } = await supabase.from("task_attachments").insert([{ task_id: taskId, uploaded_by: currentUser.id, file_url: publicURL, file_name: file.name }]);
    if (insertErr) toast({ title: "Insert attachment failed", description: insertErr.message, status: "error" });
    else setAttachmentsMap(prev => ({ ...prev, [taskId]: [...(prev[taskId] || []), data[0]] }));
  };

  const deleteAttachment = async (attachmentId, taskId) => {
    const { error } = await supabase.from("task_attachments").delete().eq("id", attachmentId);
    if (error) toast({ title: "Delete failed", description: error.message, status: "error" });
    else setAttachmentsMap(prev => ({ ...prev, [taskId]: prev[taskId].filter(a => a.id !== attachmentId) }));
  };

  const startRenameAttachment = (attachmentId, currentName) => {
    setEditAttachmentMap(prev => ({ ...prev, [attachmentId]: true }));
    setEditAttachmentText(prev => ({ ...prev, [attachmentId]: currentName }));
  };

  const saveRenameAttachment = async (attachmentId, taskId) => {
    const newName = editAttachmentText[attachmentId]?.trim(); if (!newName) return;
    const { error } = await supabase.from("task_attachments").update({ file_name: newName }).eq("id", attachmentId);
    if (error) toast({ title: "Rename failed", description: error.message, status: "error" });
    else {
      setAttachmentsMap(prev => ({ ...prev, [taskId]: prev[taskId].map(a => a.id === attachmentId ? { ...a, file_name: newName } : a) }));
      setEditAttachmentMap(prev => { const copy = { ...prev }; delete copy[attachmentId]; return copy; });
      setEditAttachmentText(prev => { const copy = { ...prev }; delete copy[attachmentId]; return copy; });
    }
  };

  if (loading) return <Box p={6}><Heading size="lg" mb={4}>My Tasks</Heading><Spinner /></Box>;
  if (!currentUser) return <Box p={6}><Heading size="lg" mb={4}>My Tasks</Heading><Text>Unable to detect current user — please sign in.</Text></Box>;

  const filteredTasks = tasks.filter(t => (!filterDept || t.department_id === filterDept) && (!filterStatus || t.status === filterStatus));

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>My Tasks</Heading>
      <HStack mb={4} spacing={4}>
        <Select placeholder="Filter by Department" value={filterDept} onChange={e => setFilterDept(e.target.value)} maxW="200px">
          {Object.values(departmentsMap).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <Select placeholder="Filter by Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} maxW="200px">
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      </HStack>

      {filteredTasks.length === 0 ? <Text>No tasks match the filter.</Text> : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {filteredTasks.map(t => {
            const dept = departmentsMap[t.department_id] || {};
            const assignedByName = assignedByMap[t.created_by] || "—";
            const isExpanded = expandedTaskIds.includes(t.id);
            return (
              <Card key={t.id} borderWidth="1px" shadow="sm">
                <CardHeader>
                  <HStack justify="space-between" align="start">
                    <VStack align="start">
                      <Text fontWeight="bold" fontSize="lg">{t.title}</Text>
                      {dept.name && <Badge>{dept.name}</Badge>}
                      {assignedByName && <Badge colorScheme="green">Assigned by {assignedByName}</Badge>}
                      {t.priority && <Badge>{t.priority.replace("_"," ")}</Badge>}
                    </VStack>
                    <Button size="sm" onClick={() => toggleExpand(t.id)}>{isExpanded ? "Collapse" : "Expand"}</Button>
                  </HStack>
                </CardHeader>

                <CardBody>
                  <Text fontSize="sm" mb={2}>{t.description || "No description"}</Text>
                  <Text fontSize="sm" color="gray.600" mb={2}>Status:</Text>
                  <Select value={t.status} onChange={e => updateTaskStatus(t.id, e.target.value)} maxW="220px">
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>

                  <Collapse in={isExpanded} animateOpacity>
                    <Box mt={3} p={2} borderTop="1px dashed #ccc">
                      {/* Comments */}
                      <Text fontWeight="bold" mb={1}>Comments</Text>
                      {(commentsMap[t.id] || []).map(c => (
                        <HStack key={c.id} mb={1} bg="gray.50" p={1} borderRadius="md" justify="space-between">
                          {editCommentMap[c.id] ? (
                            <>
                              <Input size="sm" value={editCommentText[c.id]} onChange={e => setEditCommentText(prev => ({ ...prev, [c.id]: e.target.value }))}/>
                              <HStack>
                                <IconButton size="sm" icon={<CheckIcon />} onClick={() => saveEditComment(c.id, t.id)} />
                                <IconButton size="sm" icon={<CloseIcon />} onClick={() => setEditCommentMap(prev => { const copy = {...prev}; delete copy[c.id]; return copy; })} />
                              </HStack>
                            </>
                          ) : (
                            <>
                              <Text fontSize="sm">{c.comment}</Text>
                              {c.user_id === currentUser.id && (
                                <HStack>
                                  <IconButton size="sm" icon={<EditIcon />} onClick={() => handleEditComment(c.id, c.comment)} />
                                  <IconButton size="sm" icon={<DeleteIcon />} onClick={() => deleteComment(c.id, t.id)} />
                                </HStack>
                              )}
                            </>
                          )}
                        </HStack>
                      ))}
                      <HStack mt={2}>
                        <Input placeholder="Add comment..." size="sm" value={newComments[t.id] || ""} onChange={e => setNewComments(prev => ({ ...prev, [t.id]: e.target.value }))}/>
                        <IconButton icon={<AddIcon />} size="sm" onClick={() => handleAddComment(t.id)} />
                      </HStack>

                      {/* Attachments */}
                      <Text fontWeight="bold" mt={3} mb={1}>Attachments</Text>
                      {(attachmentsMap[t.id] || []).map(a => (
                        <HStack key={a.id} justify="space-between">
                          {editAttachmentMap[a.id] ? (
                            <>
                              <Input size="sm" value={editAttachmentText[a.id]} onChange={e => setEditAttachmentText(prev => ({ ...prev, [a.id]: e.target.value }))} maxW="200px"/>
                              <HStack>
                                <IconButton size="sm" icon={<CheckIcon />} onClick={() => saveRenameAttachment(a.id, t.id)} />
                                <IconButton size="sm" icon={<CloseIcon />} onClick={() => setEditAttachmentMap(prev => { const copy = {...prev}; delete copy[a.id]; return copy; })} />
                              </HStack>
                            </>
                          ) : (
                            <>
                              <Link href={a.file_url} isExternal color="blue.500">{a.file_name}</Link>
                              {a.uploaded_by === currentUser.id && (
                                <HStack>
                                  <IconButton size="sm" icon={<EditIcon />} onClick={() => startRenameAttachment(a.id, a.file_name)} />
                                  <IconButton size="sm" icon={<DeleteIcon />} onClick={() => deleteAttachment(a.id, t.id)} />
                                </HStack>
                              )}
                            </>
                          )}
                        </HStack>
                      ))}
                      <Input type="file" mt={2} size="sm" onChange={e => handleFileUpload(t.id, e)} />
                    </Box>
                  </Collapse>
                </CardBody>

                <CardFooter justify="space-between">
                  <Text fontSize="xs" color="gray.500">Created on {t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}</Text>
                </CardFooter>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default MyTasks;
