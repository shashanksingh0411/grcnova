import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
  Tag,
  TagLabel,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  SimpleGrid
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabase";
import { SearchIcon, DeleteIcon, AddIcon, EditIcon, ChevronLeftIcon, ChevronRightIcon, ViewIcon } from "@chakra-ui/icons";

const RISK_CATEGORIES = [
  "Strategic", "Operational", "Financial", "Compliance", 
  "Reputational", "Technical", "Security", "Third-Party"
];

const IMPACT_LEVELS = [
  { value: 1, label: "1 - Negligible", description: "Minimal business impact" },
  { value: 2, label: "2 - Minor", description: "Localized impact, easily contained" },
  { value: 3, label: "3 - Moderate", description: "Significant department-level impact" },
  { value: 4, label: "4 - Major", description: "Serious organization-wide impact" },
  { value: 5, label: "5 - Catastrophic", description: "Threatens business viability" }
];

const LIKELIHOOD_LEVELS = [
  { value: 1, label: "1 - Rare", description: "Unlikely to occur" },
  { value: 2, label: "2 - Unlikely", description: "Possible but not expected" },
  { value: 3, label: "3 - Possible", description: "Could occur occasionally" },
  { value: 4, label: "4 - Likely", description: "Will probably occur" },
  { value: 5, label: "5 - Almost Certain", description: "Expected to occur" }
];

const STATUS_OPTIONS = [
  "Open", "In Progress", "Mitigated", "Closed", "Accepted"
];

const REVIEW_FREQUENCIES = [
  "Monthly", "Quarterly", "Semi-Annually", "Annually", "Biannually"
];

// Available frameworks for filtering
const AVAILABLE_FRAMEWORKS = [
  "All Frameworks",
  "GDPR",
  "ISO27001",
  "HIPAA",
  "NIST",
  "SOC2",
  "PCI-DSS",
  "SOX"
];

// Framework mapping for flexible filtering
const FRAMEWORK_MAPPING = {
  "GDPR": ["gdpr", "general data protection regulation"],
  "ISO27001": ["iso27001", "iso 27001", "iso-27001"],
  "HIPAA": ["hipaa", "health insurance portability and accountability act"],
  "NIST": ["nist", "national institute of standards and technology"],
  "SOC2": ["soc2", "soc 2", "soc-2"],
  "PCI-DSS": ["pci-dss", "pci dss", "pci"],
  "SOX": ["sox", "sarbanes-oxley"]
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <Flex justify="center" align="center" mt={4} gap={2}>
      <IconButton
        aria-label="Previous page"
        icon={<ChevronLeftIcon />}
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
      />
      <Text fontSize="sm">
        Page {currentPage} of {totalPages}
      </Text>
      <IconButton
        aria-label="Next page"
        icon={<ChevronRightIcon />}
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
      />
    </Flex>
  );
};

// View Modal component
const ViewModal = ({ isOpen, onClose, title, content }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="lg">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Box 
          p={4} 
          bg="gray.50" 
          borderRadius="md" 
          maxH="400px" 
          overflowY="auto"
        >
          {content ? (
            <Text whiteSpace="pre-wrap">{content}</Text>
          ) : (
            <Text color="gray.500" fontStyle="italic">
              No {title.toLowerCase()} available
            </Text>
          )}
        </Box>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

// Risk Modal component
const RiskModal = ({ isOpen, onClose, title, onSubmit, formData, handleInputChange, loading, calculateRiskLevel }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="xl">
    <ModalOverlay />
    <ModalContent as="form" onSubmit={onSubmit}>
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack spacing={4}>
          <SimpleGrid columns={2} spacing={4} width="100%">
            <FormControl isRequired>
              <FormLabel>Framework Key</FormLabel>
              <Input
                name="framework_key"
                value={formData.framework_key}
                onChange={handleInputChange}
                placeholder="e.g., iso27001, gdpr, hipaa"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Risk Category</FormLabel>
              <Select
                name="risk_category"
                value={formData.risk_category}
                onChange={handleInputChange}
                placeholder="Select category"
              >
                {RISK_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          <FormControl isRequired>
            <FormLabel>Risk Title</FormLabel>
            <Input
              name="risk_title"
              value={formData.risk_title}
              onChange={handleInputChange}
              placeholder="Brief risk description"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Risk Description</FormLabel>
            <Textarea
              name="risk_description"
              value={formData.risk_description}
              onChange={handleInputChange}
              placeholder="Detailed risk description"
              rows={3}
            />
          </FormControl>

          <SimpleGrid columns={2} spacing={4} width="100%">
            <FormControl isRequired>
              <FormLabel>Impact</FormLabel>
              <Select
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                placeholder="Select impact"
              >
                {IMPACT_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Likelihood</FormLabel>
              <Select
                name="likelihood"
                value={formData.likelihood}
                onChange={handleInputChange}
                placeholder="Select likelihood"
              >
                {LIKELIHOOD_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          <FormControl>
            <FormLabel>Existing Controls</FormLabel>
            <Textarea
              name="existing_controls"
              value={formData.existing_controls}
              onChange={handleInputChange}
              placeholder="Describe existing controls"
              rows={2}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Mitigation Plan</FormLabel>
            <Textarea
              name="mitigation_plan"
              value={formData.mitigation_plan}
              onChange={handleInputChange}
              placeholder="Describe mitigation plan"
              rows={2}
            />
          </FormControl>

          <SimpleGrid columns={2} spacing={4} width="100%">
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Residual Risk</FormLabel>
              <Select
                name="residual_risk"
                value={formData.residual_risk}
                onChange={handleInputChange}
                placeholder="Select residual risk"
              >
                {IMPACT_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={2} spacing={4} width="100%">
            <FormControl>
              <FormLabel>Review Frequency</FormLabel>
              <Select
                name="review_frequency"
                value={formData.review_frequency}
                onChange={handleInputChange}
                placeholder="Select frequency"
              >
                {REVIEW_FREQUENCIES.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Next Review Date</FormLabel>
              <Input
                type="date"
                name="next_review_date"
                value={formData.next_review_date}
                onChange={handleInputChange}
              />
            </FormControl>
          </SimpleGrid>

          <FormControl>
            <FormLabel>Last Review Date</FormLabel>
            <Input
              type="date"
              name="last_review_date"
              value={formData.last_review_date}
              onChange={handleInputChange}
            />
          </FormControl>

          {formData.impact && formData.likelihood && (
            <Box width="100%" p={3} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold">Risk Assessment:</Text>
              <Text>
                Score: {parseInt(formData.impact || 0) * parseInt(formData.likelihood || 0)} -{" "}
                {calculateRiskLevel(parseInt(formData.impact || 0), parseInt(formData.likelihood || 0))}
              </Text>
            </Box>
          )}
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" mr={3} onClick={onClose}>
          Cancel
        </Button>
        <Button 
          colorScheme="blue" 
          type="submit"
          isLoading={loading}
        >
          {title.includes("Add") ? "Add Risk" : "Save Changes"}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default function RiskAssessmentTable() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = useState("");

  // Auth
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Data
  const [predefinedRisks, setPredefinedRisks] = useState([]);
  const [filteredPredefinedRisks, setFilteredPredefinedRisks] = useState([]);
  const [userRisks, setUserRisks] = useState([]);

  // Separate loading states for different operations
  const [predefinedLoading, setPredefinedLoading] = useState(false);
  const [userRisksLoading, setUserRisksLoading] = useState(false);
  const [riskOperationLoading, setRiskOperationLoading] = useState(false);

  // Framework Filter
  const [selectedFramework, setSelectedFramework] = useState("All Frameworks");

  // Pagination
  const [currentPredefinedPage, setCurrentPredefinedPage] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);
  
  // View Modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewModalTitle, setViewModalTitle] = useState("");
  const [viewModalContent, setViewModalContent] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    framework_key: "",
    risk_title: "",
    risk_description: "",
    risk_category: "",
    likelihood: "",
    impact: "",
    existing_controls: "",
    mitigation_plan: "",
    status: "Open",
    residual_risk: "",
    review_frequency: "",
    next_review_date: "",
    last_review_date: ""
  });

  // ---------- Auth ----------
  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN") {
        fetchUserRisks();
        onClose();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchUserRisks();
    }
    fetchPredefinedRisks();
  };

  // ---------- Fetch Predefined Risks ----------
  const fetchPredefinedRisks = async () => {
    try {
      setPredefinedLoading(true);
      const { data, error } = await supabase
        .from("risk_checklist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setPredefinedRisks(data || []);
      setFilteredPredefinedRisks(data || []);
    } catch (error) {
      toast({
        title: "Error fetching predefined risks",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setPredefinedLoading(false);
    }
  };

  // ---------- Framework Filter Handler ----------
  const handleFrameworkFilter = (framework) => {
    setSelectedFramework(framework);
    setCurrentPredefinedPage(1);
    
    if (framework === "All Frameworks") {
      setFilteredPredefinedRisks(predefinedRisks);
    } else {
      const filtered = predefinedRisks.filter(risk => {
        if (!risk.framework) return false;
        
        const riskFramework = risk.framework.toLowerCase();
        const selectedFrameworkLower = framework.toLowerCase();
        
        if (riskFramework === selectedFrameworkLower) return true;
        
        const frameworkVariations = FRAMEWORK_MAPPING[framework];
        if (frameworkVariations) {
          return frameworkVariations.some(variation => 
            riskFramework.includes(variation)
          );
        }
        
        return riskFramework.includes(selectedFrameworkLower);
      });
      setFilteredPredefinedRisks(filtered);
    }
  };

  // ---------- Fetch User Risks ----------
  const fetchUserRisks = async () => {
    try {
      setUserRisksLoading(true);
      const { data, error } = await supabase
        .from("risk_register")
        .select(`
          *,
          profiles:risk_owner (
            id,
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserRisks(data || []);
    } catch (error) {
      toast({
        title: "Error fetching user risks",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setUserRisksLoading(false);
    }
  };

  // ---------- Pagination Logic ----------
  const paginatedPredefinedRisks = useMemo(() => {
    const startIndex = (currentPredefinedPage - 1) * itemsPerPage;
    return filteredPredefinedRisks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPredefinedRisks, currentPredefinedPage, itemsPerPage]);

  const paginatedUserRisks = useMemo(() => {
    const startIndex = (currentUserPage - 1) * itemsPerPage;
    return userRisks.slice(startIndex, startIndex + itemsPerPage);
  }, [userRisks, currentUserPage, itemsPerPage]);

  const totalPredefinedPages = Math.ceil(filteredPredefinedRisks.length / itemsPerPage);
  const totalUserPages = Math.ceil(userRisks.length / itemsPerPage);

  // ---------- Risk Calculation Helpers ----------
  const calculateRiskLevel = (impact, likelihood) => {
    const score = impact * likelihood;
    if (score >= 20) return "Critical";
    if (score >= 15) return "High";
    if (score >= 10) return "Medium";
    if (score >= 5) return "Low";
    return "Very Low";
  };

  const getRiskColorScheme = (riskLevel) => {
    switch (riskLevel) {
      case "Critical": return "red";
      case "High": return "orange";
      case "Medium": return "yellow";
      case "Low": return "green";
      case "Very Low": return "blue";
      default: return "gray";
    }
  };

  // ---------- View Modal Handlers ----------
  const openViewModal = (title, content) => {
    setViewModalTitle(title);
    setViewModalContent(content || "No content available");
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewModalTitle("");
    setViewModalContent("");
  };

  // ---------- Handlers ----------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailSignIn = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }
      });
      if (error) throw error;
      toast({
        title: "Check your email",
        description: "We've sent a login link to your email address.",
        status: "success",
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: "Sign in error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setAuthLoading(false);
    }
  };

  // ---------- Modal Functions ----------
  const openAddModal = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add risks",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    setFormData({
      framework_key: "",
      risk_title: "",
      risk_description: "",
      risk_category: "",
      likelihood: "",
      impact: "",
      existing_controls: "",
      mitigation_plan: "",
      status: "Open",
      residual_risk: "",
      review_frequency: "",
      next_review_date: "",
      last_review_date: ""
    });
    setEditingRisk(null);
    setAddModalOpen(true);
  };

  const openEditModal = (risk, isPredefined = false) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to edit risks",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setEditingRisk({ ...risk, isPredefined });
    
    let riskData;
    
    if (isPredefined) {
      riskData = {
        framework_key: risk.framework || "general",
        risk_title: risk.risk_description ? risk.risk_description.substring(0, 100) : "Unknown Risk",
        risk_description: risk.risk_description || "",
        risk_category: risk.risk_category || "",
        likelihood: risk.likelihood_num?.toString() || "3",
        impact: risk.impact_num?.toString() || "3",
        existing_controls: risk.mitigation_treatment_plan || "",
        mitigation_plan: risk.mitigation_treatment_plan || "",
        status: risk.status || "Open",
        residual_risk: risk.impact_num?.toString() || "3",
        review_frequency: "Quarterly",
        next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        last_review_date: new Date().toISOString().split('T')[0]
      };
    } else {
      riskData = {
        framework_key: risk.framework_key || "",
        risk_title: risk.risk_title || "",
        risk_description: risk.risk_description || "",
        risk_category: risk.risk_category || "",
        likelihood: risk.likelihood?.toString() || "",
        impact: risk.impact?.toString() || "",
        existing_controls: risk.existing_controls || "",
        mitigation_plan: risk.mitigation_plan || "",
        status: risk.status || "Open",
        residual_risk: risk.residual_risk?.toString() || "",
        review_frequency: risk.review_frequency || "",
        next_review_date: risk.next_review_date || "",
        last_review_date: risk.last_review_date || ""
      };
    }

    setFormData(riskData);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingRisk(null);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setFormData({
      framework_key: "",
      risk_title: "",
      risk_description: "",
      risk_category: "",
      likelihood: "",
      impact: "",
      existing_controls: "",
      mitigation_plan: "",
      status: "Open",
      residual_risk: "",
      review_frequency: "",
      next_review_date: ""
    });
  };

  // ---------- Save Risk Function ----------
  const handleSaveRisk = async (e) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save risks",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const { framework_key, risk_title, risk_category, likelihood, impact } = formData;
    if (!framework_key || !risk_title || !risk_category || !likelihood || !impact) {
      toast({
        title: "Missing required fields",
        description: "Please fill all required fields",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      setRiskOperationLoading(true);

      // Ensure user has a profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      if (!profile) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([{
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email,
            email: user.email,
            role: "user"
          }])
          .select("id")
          .single();

        if (createError) throw createError;
      }

      if (editingRisk && !editingRisk.isPredefined) {
        // Update existing risk
        const { error } = await supabase
          .from("risk_register")
          .update({
            framework_key: formData.framework_key,
            risk_title: formData.risk_title,
            risk_description: formData.risk_description,
            risk_category: formData.risk_category,
            likelihood: parseInt(formData.likelihood),
            impact: parseInt(formData.impact),
            existing_controls: formData.existing_controls,
            mitigation_plan: formData.mitigation_plan,
            status: formData.status,
            residual_risk: parseInt(formData.residual_risk) || null,
            review_frequency: formData.review_frequency,
            next_review_date: formData.next_review_date,
            last_review_date: formData.last_review_date || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingRisk.id);

        if (error) throw error;

        toast({
          title: "Risk updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true
        });
        setEditModalOpen(false);
      } else {
        // Insert new risk
        const riskId = `RISK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const impactNum = parseInt(formData.impact);
        const likelihoodNum = parseInt(formData.likelihood);
        const riskLevel = calculateRiskLevel(impactNum, likelihoodNum);

        const { error } = await supabase
          .from("risk_register")
          .insert([{
            framework_key: formData.framework_key,
            risk_id: riskId,
            risk_title: formData.risk_title,
            risk_description: formData.risk_description,
            risk_category: formData.risk_category,
            likelihood: likelihoodNum,
            impact: impactNum,
            risk_level: riskLevel,
            existing_controls: formData.existing_controls,
            mitigation_plan: formData.mitigation_plan,
            risk_owner: user.id,
            status: formData.status,
            residual_risk: parseInt(formData.residual_risk) || null,
            review_frequency: formData.review_frequency,
            next_review_date: formData.next_review_date,
            last_review_date: formData.last_review_date || null,
            related_control_refs: null,
            evidence_links: null
          }]);

        if (error) throw error;

        toast({
          title: editingRisk?.isPredefined ? "Risk added to register" : "Risk created successfully",
          description: `"${formData.risk_title}" has been ${editingRisk?.isPredefined ? "added to your register" : "created"}`,
          status: "success",
          duration: 3000,
          isClosable: true
        });
        setEditModalOpen(false);
        setAddModalOpen(false);
      }

      setEditingRisk(null);
      setFormData({
        framework_key: "",
        risk_title: "",
        risk_description: "",
        risk_category: "",
        likelihood: "",
        impact: "",
        existing_controls: "",
        mitigation_plan: "",
        status: "Open",
        residual_risk: "",
        review_frequency: "",
        next_review_date: ""
      });
      fetchUserRisks();
    } catch (error) {
      console.error("Error saving risk:", error);
      toast({
        title: "Error saving risk",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setRiskOperationLoading(false);
    }
  };

  const deleteRisk = async (id) => {
    try {
      setRiskOperationLoading(true);
      const { error } = await supabase.from("risk_register").delete().eq("id", id);
      if (error) throw error;
      setUserRisks(prev => prev.filter(r => r.id !== id));
      toast({ title: "Risk deleted", status: "info", duration: 2000, isClosable: true });
    } catch (error) {
      toast({
        title: "Error deleting risk",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setRiskOperationLoading(false);
    }
  };

  return (
    <Box p={6} maxW="1400px" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading as="h1" size="xl">Risk Management Register</Heading>
          <Text color="gray.600">Manage and track compliance framework risks</Text>
        </VStack>
        <HStack>
          {user && (
            <Button onClick={openAddModal} colorScheme="blue" leftIcon={<AddIcon />}>
              Add Risk
            </Button>
          )}
          {!user && (
            <Button onClick={onOpen} colorScheme="blue" leftIcon={<AddIcon />}>
              Sign In
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Sign In Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign In to Risk Assessment Manager</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Enter your email address to receive a secure login link</Text>
            <Input
              placeholder="your.email@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleEmailSignIn} 
              isLoading={authLoading}
              loadingText="Sending"
            >
              Send Login Link
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {!user && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          Please sign in to add and manage risks. Your data will be securely saved to your account.
        </Alert>
      )}

      <Tabs colorScheme="blue" isLazy>
        <TabList mb={4}>
          <Tab>Predefined Risks ({filteredPredefinedRisks.length})</Tab>
          <Tab>My Risk Register ({userRisks.length})</Tab>
        </TabList>

        <TabPanels>
          {/* Predefined Risks Tab */}
          <TabPanel p={0}>
            <Card variant="outlined" mb={6}>
              <CardHeader pb={0}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">Predefined Compliance Risks</Heading>
                  <HStack spacing={4}>
                    <FormControl width="200px">
                      <Select
                        value={selectedFramework}
                        onChange={(e) => handleFrameworkFilter(e.target.value)}
                        size="md"
                      >
                        {AVAILABLE_FRAMEWORKS.map(framework => (
                          <option key={framework} value={framework}>
                            {framework}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <Text color="gray.600" fontSize="sm">
                      {selectedFramework === "All Frameworks" 
                        ? `Showing all ${filteredPredefinedRisks.length} risks`
                        : `Showing ${filteredPredefinedRisks.length} ${selectedFramework}-related risks`
                      }
                    </Text>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                {predefinedLoading && predefinedRisks.length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <Spinner size="xl" thickness="3px" />
                    <Text mt={4}>Loading predefined risks...</Text>
                  </Box>
                ) : (
                  <>
                    <Box overflowX="auto" borderRadius="md" borderWidth="1px">
                      <Table variant="simple" size="md">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th width="12%">Framework</Th>
                            <Th width="10%">Articles/Controls</Th>
                            <Th width="12%">Risk Category</Th>
                            <Th width="18%">Risk Description</Th>
                            <Th width="8%">Likelihood</Th>
                            <Th width="8%">Impact</Th>
                            <Th width="10%">Risk Score</Th>
                            <Th width="15%">Mitigations</Th>
                            <Th width="10%">Status</Th>
                            {user && <Th width="7%">Actions</Th>}
                          </Tr>
                        </Thead>
                        <Tbody>
                          {paginatedPredefinedRisks.map((risk) => (
                            <Tr key={risk.id} _hover={{ bg: "gray.50" }}>
                              <Td>
                                <Badge colorScheme="purple">{risk.framework}</Badge>
                              </Td>
                              <Td>
                                {risk.gdpr_article ? (
                                  <Text fontSize="sm" fontWeight="medium">
                                    {risk.gdpr_article}
                                  </Text>
                                ) : (
                                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                    Not specified
                                  </Text>
                                )}
                              </Td>
                              <Td>
                                <Badge colorScheme="blue" variant="subtle">
                                  {risk.risk_category}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Text 
                                    fontSize="sm" 
                                    noOfLines={2} 
                                    flex={1}
                                    cursor="pointer"
                                    _hover={{ color: "blue.500", textDecoration: "underline" }}
                                    onClick={() => openViewModal("Risk Description", risk.risk_description)}
                                  >
                                    {risk.risk_description || "No description"}
                                  </Text>
                                  <Tooltip label="View full description">
                                    <IconButton
                                      aria-label="View risk description"
                                      icon={<ViewIcon />}
                                      size="xs"
                                      variant="ghost"
                                      colorScheme="blue"
                                      onClick={() => openViewModal("Risk Description", risk.risk_description)}
                                    />
                                  </Tooltip>
                                </HStack>
                              </Td>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="sm">{risk.likelihood}</Text>
                                  <Text fontSize="xs" color="gray.600">
                                    ({risk.likelihood_num}/5)
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="sm">{risk.inherent_impact}</Text>
                                  <Text fontSize="xs" color="gray.600">
                                    ({risk.impact_num}/5)
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold">{risk.risk_score}</Text>
                                  <Tag 
                                    colorScheme={getRiskColorScheme(
                                      calculateRiskLevel(risk.impact_num, risk.likelihood_num)
                                    )} 
                                    size="sm" 
                                    borderRadius="full"
                                  >
                                    <TagLabel>
                                      {calculateRiskLevel(risk.impact_num, risk.likelihood_num)}
                                    </TagLabel>
                                  </Tag>
                                </VStack>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <VStack align="start" spacing={1} flex={1}>
                                    {risk.mitigation_treatment_plan ? (
                                      <>
                                        <Text 
                                          fontSize="sm" 
                                          noOfLines={2}
                                          cursor="pointer"
                                          _hover={{ color: "blue.500", textDecoration: "underline" }}
                                          onClick={() => openViewModal("Mitigation Plan", risk.mitigation_treatment_plan)}
                                        >
                                          {risk.mitigation_treatment_plan}
                                        </Text>
                                        {risk.responsible_party && (
                                          <Badge colorScheme="green" variant="outline" size="sm">
                                            {risk.responsible_party}
                                          </Badge>
                                        )}
                                      </>
                                    ) : (
                                      <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                        No mitigation plan
                                      </Text>
                                    )}
                                  </VStack>
                                  {risk.mitigation_treatment_plan && (
                                    <Tooltip label="View mitigation details">
                                      <IconButton
                                        aria-label="View mitigation plan"
                                        icon={<ViewIcon />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="green"
                                        onClick={() => openViewModal("Mitigation Plan", risk.mitigation_treatment_plan)}
                                      />
                                    </Tooltip>
                                  )}
                                </HStack>
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    risk.status === "Closed" || risk.status === "Accepted" ? "green" : 
                                    risk.status === "In Progress" ? "blue" : 
                                    risk.status === "Mitigated" ? "teal" : "orange"
                                  }
                                  variant="subtle"
                                >
                                  {risk.status}
                                </Badge>
                              </Td>
                              {user && (
                                <Td>
                                  <HStack spacing={1}>
                                    <Tooltip label="Add to my register" hasArrow>
                                      <IconButton
                                        aria-label="Add to register"
                                        icon={<AddIcon />}
                                        size="sm"
                                        colorScheme="green"
                                        variant="outline"
                                        onClick={() => openEditModal(risk, true)}
                                        isLoading={riskOperationLoading}
                                      />
                                    </Tooltip>
                                  </HStack>
                                </Td>
                              )}
                            </Tr>
                          ))}
                          {filteredPredefinedRisks.length === 0 && (
                            <Tr>
                              <Td colSpan={user ? 10 : 9} textAlign="center" py={10}>
                                {selectedFramework === "All Frameworks" 
                                  ? "No predefined risks found." 
                                  : `No ${selectedFramework} risks found. Try selecting "All Frameworks".`
                                }
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                    {totalPredefinedPages > 1 && (
                      <Pagination
                        currentPage={currentPredefinedPage}
                        totalPages={totalPredefinedPages}
                        onPageChange={setCurrentPredefinedPage}
                      />
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* My Risk Register Tab */}
          <TabPanel p={0}>
            <Card variant="outlined" mb={6}>
              <CardHeader pb={0}>
                <Flex justify="space-between" align="center">
                  <Heading size="md">My Risk Register</Heading>
                  {userRisks.length > 0 && (
                    <Text color="gray.600" fontSize="sm">
                      Showing {paginatedUserRisks.length} of {userRisks.length} risks
                    </Text>
                  )}
                </Flex>
              </CardHeader>
              <CardBody>
                {userRisksLoading && userRisks.length === 0 ? (
                  <Box textAlign="center" py={10}>
                    <Spinner size="xl" thickness="3px" />
                    <Text mt={4}>Loading your risk register...</Text>
                  </Box>
                ) : (
                  <>
                    <Box overflowX="auto" borderRadius="md" borderWidth="1px">
                      <Table variant="simple" size="md">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th width="23%">Risk Details</Th>
                            <Th width="12%">Framework</Th>
                            <Th width="20%">Assessment</Th>
                            <Th width="22%">Status & Review</Th>
                            {user && <Th width="15%">Actions</Th>}
                          </Tr>
                        </Thead>
                        <Tbody>
                          {paginatedUserRisks.map((risk) => (
                            <Tr key={risk.id} _hover={{ bg: "gray.50" }}>
                              <Td>
                                <VStack align="start" spacing={2}>
                                  <HStack spacing={2} width="100%">
                                    <Text fontWeight="bold" flex={1}>
                                      {risk.risk_title}
                                    </Text>
                                    <Tooltip label="View risk description">
                                      <IconButton
                                        aria-label="View risk description"
                                        icon={<ViewIcon />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="blue"
                                        onClick={() => openViewModal("Risk Description", risk.risk_description)}
                                      />
                                    </Tooltip>
                                  </HStack>
                                  {risk.risk_description && (
                                    <Text 
                                      fontSize="sm" 
                                      color="gray.600" 
                                      noOfLines={2}
                                      cursor="pointer"
                                      _hover={{ color: "blue.500" }}
                                      onClick={() => openViewModal("Risk Description", risk.risk_description)}
                                    >
                                      {risk.risk_description}
                                    </Text>
                                  )}
                                  <Badge colorScheme="blue" variant="outline">
                                    {risk.risk_category}
                                  </Badge>
                                </VStack>
                              </Td>
                              <Td>
                                <Badge colorScheme="purple">{risk.framework_key}</Badge>
                              </Td>
                              <Td>
                                <VStack align="start" spacing={2}>
                                  <HStack>
                                    <Text fontSize="sm">Impact: {risk.impact}/5</Text>
                                    <Text fontSize="sm">Likelihood: {risk.likelihood}/5</Text>
                                  </HStack>
                                  <HStack>
                                    <Text fontWeight="bold">Score: {risk.impact * risk.likelihood}</Text>
                                    <Tag 
                                      colorScheme={getRiskColorScheme(risk.risk_level)} 
                                      size="sm" 
                                      borderRadius="full"
                                    >
                                      <TagLabel>{risk.risk_level}</TagLabel>
                                    </Tag>
                                  </HStack>
                                  <HStack spacing={2}>
                                    {risk.existing_controls && (
                                      <>
                                        <Text fontSize="xs" color="gray.600" noOfLines={1} flex={1}>
                                          Controls: {risk.existing_controls}
                                        </Text>
                                        <Tooltip label="View controls">
                                          <IconButton
                                            aria-label="View existing controls"
                                            icon={<ViewIcon />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="teal"
                                            onClick={() => openViewModal("Existing Controls", risk.existing_controls)}
                                          />
                                        </Tooltip>
                                      </>
                                    )}
                                  </HStack>
                                  <HStack spacing={2}>
                                    {risk.mitigation_plan && (
                                      <>
                                        <Text fontSize="xs" color="gray.600" noOfLines={1} flex={1}>
                                          Mitigation: {risk.mitigation_plan}
                                        </Text>
                                        <Tooltip label="View mitigation plan">
                                          <IconButton
                                            aria-label="View mitigation plan"
                                            icon={<ViewIcon />}
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="green"
                                            onClick={() => openViewModal("Mitigation Plan", risk.mitigation_plan)}
                                          />
                                        </Tooltip>
                                      </>
                                    )}
                                  </HStack>
                                </VStack>
                              </Td>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <Badge
                                    colorScheme={
                                      risk.status === "Closed" || risk.status === "Accepted" ? "green" : 
                                      risk.status === "In Progress" ? "blue" : "orange"
                                    }
                                    variant="subtle"
                                  >
                                    {risk.status}
                                  </Badge>
                                  {risk.last_review_date && (
                                    <Text fontSize="xs" color="gray.600">
                                      Last Review: {new Date(risk.last_review_date).toLocaleDateString()}
                                    </Text>
                                  )}
                                  {risk.next_review_date && (
                                    <Text fontSize="xs" color="gray.600">
                                      Review: {new Date(risk.next_review_date).toLocaleDateString()}
                                    </Text>
                                  )}
                                  {risk.review_frequency && (
                                    <Text fontSize="xs" color="gray.600">
                                      Frequency: {risk.review_frequency}
                                    </Text>
                                  )}
                                </VStack>
                              </Td>
                              {user && (
                                <Td>
                                  <HStack>
                                    <Tooltip label="Edit risk" hasArrow>
                                      <IconButton
                                        aria-label="Edit risk"
                                        icon={<EditIcon />}
                                        size="sm"
                                        colorScheme="blue"
                                        variant="outline"
                                        onClick={() => openEditModal(risk, false)}
                                        isLoading={riskOperationLoading}
                                      />
                                    </Tooltip>
                                    <Tooltip label="Delete risk" hasArrow>
                                      <IconButton
                                        aria-label="Delete risk"
                                        icon={<DeleteIcon />}
                                        size="sm"
                                        colorScheme="red"
                                        variant="outline"
                                        onClick={() => deleteRisk(risk.id)}
                                        isLoading={riskOperationLoading}
                                      />
                                    </Tooltip>
                                  </HStack>
                                </Td>
                              )}
                            </Tr>
                          ))}
                          {userRisks.length === 0 && (
                            <Tr>
                              <Td colSpan={user ? 5 : 4} textAlign="center" py={10}>
                                {user 
                                  ? "No risks in your register. Add risks from the predefined templates or create new ones." 
                                  : "Sign in to view your risk register."
                                }
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                    {totalUserPages > 1 && (
                      <Pagination
                        currentPage={currentUserPage}
                        totalPages={totalUserPages}
                        onPageChange={setCurrentUserPage}
                      />
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modals */}
      <ViewModal
        isOpen={viewModalOpen}
        onClose={closeViewModal}
        title={viewModalTitle}
        content={viewModalContent}
      />

      <RiskModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        title={editingRisk?.isPredefined ? "Add Risk to Register" : "Edit Risk"}
        onSubmit={handleSaveRisk}
        formData={formData}
        handleInputChange={handleInputChange}
        loading={riskOperationLoading}
        calculateRiskLevel={calculateRiskLevel}
      />

      <RiskModal
        isOpen={addModalOpen}
        onClose={closeAddModal}
        title="Add New Risk"
        onSubmit={handleSaveRisk}
        formData={formData}
        handleInputChange={handleInputChange}
        loading={riskOperationLoading}
        calculateRiskLevel={calculateRiskLevel}
      />
    </Box>
  );
}