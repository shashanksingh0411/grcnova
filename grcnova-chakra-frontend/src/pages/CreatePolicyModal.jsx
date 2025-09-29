// src/components/policies/CreatePolicyModal.jsx
import React, { useMemo, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Select, Textarea, Switch,
  VStack, HStack, Box, Divider, IconButton, Text, useToast, Code,
  Tag, TagLabel, TagCloseButton, Tooltip, useDisclosure
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, QuestionOutlineIcon } from "@chakra-ui/icons";
import PolicyTemplatePreview from "./PolicyTemplatePreview";

// Enhanced framework hints with descriptions
const FRAMEWORKS = {
  "SOC 2": {
    hints: [
      "Encrypt data at rest and in transit.",
      "Enforce role-based access control (RBAC).",
      "Log and monitor access to sensitive systems.",
      "Review vendor security annually.",
      "Conduct security awareness training."
    ],
    description: "Service organization controls for security, availability, processing integrity, confidentiality, and privacy."
  },
  "ISO 27001": {
    hints: [
      "Maintain an ISMS with defined scope, policies, and risk treatment plan.",
      "Perform periodic risk assessments and risk treatment.",
      "Apply change management and secure development practices.",
      "Define incident response with roles and SLAs.",
      "Run internal audits and management reviews."
    ],
    description: "International standard for information security management systems."
  },
  "HIPAA": {
    hints: [
      "Protect PHI with administrative, physical, and technical safeguards.",
      "Limit PHI access using least privilege and job role.",
      "Use secure messaging and approved devices for PHI.",
      "Report potential breaches within 24 hours to Compliance.",
      "Sign BAAs with all covered vendors."
    ],
    description: "US healthcare data protection standard for protected health information (PHI)."
  },
  "GDPR": {
    hints: [
      "Collect only necessary personal data with lawful basis.",
      "Provide data subject rights (access, rectification, erasure).",
      "Data breach notification within 72 hours to authorities.",
      "Apply data minimization and storage limitation.",
      "Use DPAs with processors; apply SCCs for cross-border transfers."
    ],
    description: "EU General Data Protection Regulation for personal data protection."
  }
};

const defaultSection = () => ({ heading: "", details: "" });

export default function CreatePolicyModal({ isOpen, onClose, onCreate }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: "",
    framework: "SOC 2",
    owner: "",
    version: "1.0",
    effectiveDate: "",
    reviewDate: "",
    approver: "",
    purpose: "",
    scope: "",
    statement: "",
    roles: "",
    requirements: [],
    exceptions: "",
    enforcement: "",
    relatedPolicies: [],
    sections: [defaultSection()],
    revisionNotes: "Initial version"
  });
  const [relatedInput, setRelatedInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [useFrameworkHints, setUseFrameworkHints] = useState(true);
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();

  const requirements = useMemo(() => {
    if (!useFrameworkHints) return form.requirements;
    const base = FRAMEWORKS[form.framework]?.hints || [];
    // Merge but keep unique
    const extra = form.requirements.filter(r => !base.includes(r));
    return [...base, ...extra];
  }, [form.framework, form.requirements, useFrameworkHints]);

  const handleCreate = async () => {
    if (!form.title) {
      toast({ status: "warning", title: "Title is required" });
      return;
    }
    
    const payload = {
      ...form,
      requirements,
      createdAt: new Date().toISOString(),
      status: "draft"
    };

    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      const createdPolicy = await res.json();
      toast({ status: "success", title: "Policy created successfully" });
      onCreate(createdPolicy);
      onClose();
    } catch (err) {
      toast({ status: "error", title: "Error creating policy", description: err.message });
    }
  };

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const updateSection = (idx, key, value) => {
    setForm(prev => {
      const copy = [...prev.sections];
      copy[idx] = { ...copy[idx], [key]: value };
      return { ...prev, sections: copy };
    });
  };

  const addSection = () => setForm(prev => ({ ...prev, sections: [...prev.sections, defaultSection()] }));
  const deleteSection = (idx) => setForm(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== idx) }));

  const addRelated = () => {
    const v = relatedInput.trim();
    if (!v) return;
    setForm(prev => ({ ...prev, relatedPolicies: [...prev.relatedPolicies, v] }));
    setRelatedInput("");
  };

  const addReq = () => {
    const v = reqInput.trim();
    if (!v) return;
    setForm(prev => ({ ...prev, requirements: [...prev.requirements, v] }));
    setReqInput("");
  };

  const removeReq = (idx) => {
    setForm(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== idx) }));
  };

  const removeRelated = (idx) => {
    setForm(prev => ({ ...prev, relatedPolicies: prev.relatedPolicies.filter((_, i) => i !== idx) }));
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader borderBottom="1px solid" borderColor="gray.700">
            <HStack>
              <Text>Create New Policy</Text>
              <Tooltip label={FRAMEWORKS[form.framework]?.description}>
                <QuestionOutlineIcon color="gray.400" />
              </Tooltip>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <HStack align="start" spacing={8}>
              {/* Form Column */}
              <VStack flex={1} align="stretch" spacing={6}>
                {/* Basic Info */}
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>Basic Information</Text>
                  <HStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Policy Title</FormLabel>
                      <Input
                        placeholder="e.g., Access Control Policy"
                        value={form.title}
                        onChange={e => updateField("title", e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Framework</FormLabel>
                      <Select
                        value={form.framework}
                        onChange={(e) => updateField("framework", e.target.value)}
                      >
                        {Object.keys(FRAMEWORKS).map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>

                  <HStack spacing={4} mt={4}>
                    <FormControl>
                      <FormLabel>Owner</FormLabel>
                      <Input 
                        placeholder="e.g., Compliance Team" 
                        value={form.owner} 
                        onChange={e => updateField("owner", e.target.value)} 
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Approver</FormLabel>
                      <Input 
                        placeholder="e.g., CISO" 
                        value={form.approver} 
                        onChange={e => updateField("approver", e.target.value)} 
                      />
                    </FormControl>
                  </HStack>

                  <HStack spacing={4} mt={4}>
                    <FormControl>
                      <FormLabel>Version</FormLabel>
                      <Input 
                        value={form.version} 
                        onChange={e => updateField("version", e.target.value)} 
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Effective Date</FormLabel>
                      <Input 
                        type="date" 
                        value={form.effectiveDate} 
                        onChange={e => updateField("effectiveDate", e.target.value)} 
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Review Date</FormLabel>
                      <Input 
                        type="date" 
                        value={form.reviewDate} 
                        onChange={e => updateField("reviewDate", e.target.value)} 
                      />
                    </FormControl>
                  </HStack>
                </Box>

                {/* Policy Content */}
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" mb={4}>Policy Content</Text>
                  <FormControl mb={4}>
                    <FormLabel>Purpose</FormLabel>
                    <Textarea 
                      rows={3} 
                      placeholder="Describe the purpose of this policy..."
                      value={form.purpose} 
                      onChange={e => updateField("purpose", e.target.value)} 
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Scope</FormLabel>
                    <Textarea 
                      rows={3} 
                      placeholder="Define what systems, people, and processes this policy applies to..."
                      value={form.scope} 
                      onChange={e => updateField("scope", e.target.value)} 
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Policy Statement</FormLabel>
                    <Textarea 
                      rows={3} 
                      placeholder="The organization will..."
                      value={form.statement} 
                      onChange={e => updateField("statement", e.target.value)} 
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Roles & Responsibilities</FormLabel>
                    <Textarea 
                      rows={3} 
                      placeholder="Define who is responsible for what..."
                      value={form.roles} 
                      onChange={e => updateField("roles", e.target.value)} 
                    />
                  </FormControl>
                </Box>

                {/* Requirements */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <FormLabel>Requirements</FormLabel>
                    <HStack>
                      <Text fontSize="sm" color="gray.400">Use {form.framework} suggestions</Text>
                      <Switch 
                        isChecked={useFrameworkHints} 
                        onChange={e => setUseFrameworkHints(e.target.checked)} 
                        size="sm" 
                      />
                    </HStack>
                  </HStack>
                  <HStack mb={2}>
                    <Input
                      placeholder="Add a requirement"
                      value={reqInput}
                      onChange={(e) => setReqInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addReq()}
                    />
                    <Button leftIcon={<AddIcon />} onClick={addReq}>Add</Button>
                  </HStack>
                  <Box minH="100px" maxH="200px" overflowY="auto" p={2} bg="gray.900" borderRadius="md">
                    {requirements.length > 0 ? (
                      <VStack align="stretch" spacing={2}>
                        {requirements.map((r, idx) => (
                          <HStack key={idx} justify="space-between" p={2} bg="gray.800" borderRadius="md">
                            <Text fontSize="sm">{r}</Text>
                            {(!useFrameworkHints || !FRAMEWORKS[form.framework].hints.includes(r)) && (
                              <IconButton 
                                size="xs" 
                                icon={<DeleteIcon />} 
                                aria-label="Remove requirement" 
                                onClick={() => removeReq(idx)} 
                              />
                            )}
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text color="gray.500" textAlign="center" py={4}>No requirements added yet</Text>
                    )}
                  </Box>
                </Box>

                {/* Additional Sections */}
                <Box>
                  <HStack justify="space-between" mb={4}>
                    <Text fontSize="lg" fontWeight="semibold">Additional Sections</Text>
                    <Button size="sm" leftIcon={<AddIcon />} onClick={addSection}>Add Section</Button>
                  </HStack>
                  <VStack align="stretch" spacing={4}>
                    {form.sections.map((s, idx) => (
                      <Box key={idx} p={4} border="1px solid" borderColor="gray.700" borderRadius="md">
                        <HStack justify="space-between" mb={3}>
                          <Input
                            placeholder="Section heading"
                            value={s.heading}
                            onChange={(e) => updateSection(idx, "heading", e.target.value)}
                          />
                          <IconButton 
                            icon={<DeleteIcon />} 
                            aria-label="Delete section" 
                            onClick={() => deleteSection(idx)} 
                          />
                        </HStack>
                        <Textarea
                          rows={3}
                          placeholder="Section details..."
                          value={s.details}
                          onChange={(e) => updateSection(idx, "details", e.target.value)}
                        />
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </VStack>

              {/* Preview Column */}
              <VStack flex={1} align="stretch" spacing={6}>
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="lg" fontWeight="semibold">Policy Preview</Text>
                    <Button size="sm" onClick={onPreviewOpen}>Full Preview</Button>
                  </HStack>
                  <Box 
                    p={4} 
                    bg="gray.900" 
                    border="1px solid" 
                    borderColor="gray.700" 
                    borderRadius="md" 
                    h="500px" 
                    overflowY="auto"
                  >
                    <Text fontWeight="bold" fontSize="xl" mb={2}>{form.title || "Untitled Policy"}</Text>
                    <Text color="gray.400" mb={4}>
                      {form.framework} • Version {form.version} • {form.effectiveDate || "No effective date"}
                    </Text>
                    
                    {form.purpose && (
                      <Box mb={4}>
                        <Text fontWeight="semibold" mb={1}>Purpose</Text>
                        <Text fontSize="sm">{form.purpose}</Text>
                      </Box>
                    )}
                    
                    {requirements.length > 0 && (
                      <Box mb={4}>
                        <Text fontWeight="semibold" mb={1}>Key Requirements</Text>
                        <VStack align="stretch" spacing={1}>
                          {requirements.slice(0, 5).map((r, i) => (
                            <Text key={i} fontSize="sm">• {r}</Text>
                          ))}
                          {requirements.length > 5 && (
                            <Text fontSize="sm" color="gray.400">+ {requirements.length - 5} more requirements</Text>
                          )}
                        </VStack>
                      </Box>
                    )}
                    
                    {form.sections[0]?.heading && (
                      <Box>
                        <Text fontWeight="semibold" mb={2}>Sections</Text>
                        <VStack align="stretch" spacing={1}>
                          {form.sections.map((s, i) => (
                            <Text key={i} fontSize="sm">• {s.heading || "Untitled section"}</Text>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Related Policies */}
                <Box>
                  <FormLabel>Related Policies</FormLabel>
                  <HStack mb={2}>
                    <Input
                      placeholder="Add related policy"
                      value={relatedInput}
                      onChange={(e) => setRelatedInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addRelated()}
                    />
                    <Button leftIcon={<AddIcon />} onClick={addRelated}>Add</Button>
                  </HStack>
                  <Box minH="50px" p={2} bg="gray.900" borderRadius="md">
                    {form.relatedPolicies.length > 0 ? (
                      <HStack flexWrap="wrap">
                        {form.relatedPolicies.map((p, idx) => (
                          <Tag key={idx} m={1}>
                            <TagLabel>{p}</TagLabel>
                            <TagCloseButton onClick={() => removeRelated(idx)} />
                          </Tag>
                        ))}
                      </HStack>
                    ) : (
                      <Text color="gray.500" textAlign="center" py={2}>No related policies added</Text>
                    )}
                  </Box>
                </Box>

                {/* Revision Notes */}
                <FormControl>
                  <FormLabel>Revision Notes</FormLabel>
                  <Textarea
                    rows={2}
                    placeholder="Describe changes in this version..."
                    value={form.revisionNotes}
                    onChange={(e) => updateField("revisionNotes", e.target.value)}
                  />
                </FormControl>
              </VStack>
            </HStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.700">
            <HStack spacing={3}>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleCreate}>Create Policy</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Full Preview Modal */}
      <PolicyTemplatePreview 
        isOpen={isPreviewOpen} 
        onClose={onPreviewClose} 
        policy={{ ...form, requirements }}
      />
    </>
  );
}