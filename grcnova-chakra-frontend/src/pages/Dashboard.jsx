// src/pages/Dashboard.jsx
import {
  Box,
  Grid,
  Text,
  Flex,
  Progress,
  List,
  ListItem,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Heading,
  Tooltip,
  IconButton,
  useColorModeValue,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tag,
  useBreakpointValue,
  useToast,
  Avatar,
  Spacer,
} from "@chakra-ui/react";

import {
  FiAlertCircle,
  FiDatabase,
  FiShield,
  FiInfo,
  FiRefreshCw,
  FiClock,
  FiGlobe,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";


import { useEffect, useState } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../auth/ProtectedRoute";

const Dashboard = () => {
  const { user, organization } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    complianceScore: 0,
    activePolicies: 0,
    pendingTasks: 0,
    upcomingAudits: 0,
    complianceStandards: [],
    pendingTasksList: [],
    frameworkProgress: [],
    policiesByRegion: [],
    evidenceStatus: {
      valid: 0,
      expired: 0,
      pendingReview: 0,
    },
    // placeholder trend data — you can replace with historical values from your DB if available
    trends: {
      complianceScore: [50, 60, 55, 70, 75],
      activePolicies: [5, 10, 12, 15, 16],
      pendingTasks: [12, 10, 14, 8, 7],
      evidenceValid: [5, 7, 6, 8, 9],
    },
  });

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.100", "gray.600");
  const progressBg = useColorModeValue("gray.100", "gray.600");
  const isMobile = useBreakpointValue({ base: true, md: false });

  const fetchDashboardData = async () => {
    try {
      if (!user?.organization_id) return;
      setIsLoading(true);

      const promises = [
        supabase.from("policies").select("*", { count: "exact" }).eq("organization_id", user.organization_id),
        supabase.from("tasks").select("*", { count: "exact" }).eq("organization_id", user.organization_id).eq("status", "pending"),
        supabase
          .from("audits")
          .select("*", { count: "exact" })
          .eq("organization_id", user.organization_id)
          .gt("scheduled_date", new Date().toISOString())
          .lt(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("compliance_standards").select("*").eq("organization_id", user.organization_id),
        supabase
          .from("tasks")
          .select("*")
          .eq("organization_id", user.organization_id)
          .eq("status", "pending")
          .order("due_date", { ascending: true })
          .limit(5),
        supabase.from("framework_progress").select("*").eq("organization_id", user.organization_id),
        supabase.from("policies").select("region, count").eq("organization_id", user.organization_id).group("region"),
        supabase.from("evidence").select("status, count").eq("organization_id", user.organization_id).group("status"),
      ];

      const results = await Promise.allSettled(promises);
      const [
        policiesResult,
        tasksResult,
        auditsResult,
        standardsResult,
        tasksDataResult,
        frameworksResult,
        regionsResult,
        evidenceResult,
      ] = results;

      const frameworksData = frameworksResult.status === "fulfilled" ? frameworksResult.value.data : [];
      const complianceScore =
        frameworksData?.reduce((acc, curr) => acc + curr.progress, 0) / (frameworksData?.length || 1) || 0;

      const evidenceData = evidenceResult.status === "fulfilled" ? evidenceResult.value.data : [];
      const evidenceStatus = {
        valid: evidenceData?.find((item) => item.status === "valid")?.count || 0,
        expired: evidenceData?.find((item) => item.status === "expired")?.count || 0,
        pendingReview: evidenceData?.find((item) => item.status === "pending_review")?.count || 0,
      };

      setDashboardData((prev) => ({
        ...prev,
        complianceScore: Math.round(complianceScore),
        activePolicies: policiesResult.status === "fulfilled" ? policiesResult.value.count || 0 : 0,
        pendingTasks: tasksResult.status === "fulfilled" ? tasksResult.value.count || 0 : 0,
        upcomingAudits: auditsResult.status === "fulfilled" ? auditsResult.value.count || 0 : 0,
        complianceStandards: standardsResult.status === "fulfilled" ? standardsResult.value.data || [] : [],
        pendingTasksList: tasksDataResult.status === "fulfilled" ? tasksDataResult.value.data || [] : [],
        frameworkProgress: frameworksData,
        policiesByRegion: regionsResult.status === "fulfilled" ? regionsResult.value.data || [] : [],
        evidenceStatus,
      }));
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organization_id]);

  const handleRefresh = async () => {
    await fetchDashboardData();
    toast({
      title: "Dashboard refreshed",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "yellow";
      default:
        return "gray";
    }
  };

  const kpiData = [
    {
      label: "Compliance Score",
      value: `${dashboardData.complianceScore}%`,
      trend: dashboardData.trends.complianceScore,
      colorFrom: "green.500",
      colorTo: "green.700",
      description: dashboardData.complianceScore > 75 ? "Good" : "Needs improvement",
    },
    {
      label: "Active Policies",
      value: dashboardData.activePolicies,
      trend: dashboardData.trends.activePolicies,
      colorFrom: "blue.500",
      colorTo: "blue.700",
      description: `${Math.floor(dashboardData.activePolicies * 0.1)} new this quarter`,
    },
    {
      label: "Pending Tasks",
      value: dashboardData.pendingTasks,
      trend: dashboardData.trends.pendingTasks,
      colorFrom: "orange.400",
      colorTo: "orange.600",
      description: dashboardData.pendingTasks > 10 ? "Needs attention" : "On track",
    },
    {
      label: "Upcoming Audits",
      value: dashboardData.upcomingAudits,
      trend: null,
      colorFrom: "purple.400",
      colorTo: "purple.600",
      description: dashboardData.upcomingAudits > 0 ? "Next in 14 days" : "No upcoming audits",
    },
  ];

  const now = Date.now();

  return (
    <ProtectedRoute>
      <Box bg={useColorModeValue("gray.50", "gray.800")} p={6} minH="100vh">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8} flexDir={isMobile ? "column" : "row"} gap={4}>
          <Box>
            <Heading as="h1" size="xl" fontWeight="bold" mb={1}>
              {organization?.name ? `${organization.name} Dashboard` : "Compliance Dashboard"}
            </Heading>
            <Text color="gray.500">Enterprise overview of compliance status</Text>
          </Box>

          <Flex align="center" gap={3} w="auto">
            <Badge colorScheme="green" p={2} borderRadius="md" display="flex" alignItems="center" fontSize="sm">
              <FiClock style={{ marginRight: 8 }} />
              Last updated: {new Date().toLocaleDateString()}
            </Badge>

            <Tooltip label="Refresh data">
              <IconButton
                icon={<FiRefreshCw />}
                aria-label="Refresh data"
                variant="outline"
                onClick={handleRefresh}
                isLoading={isLoading}
              />
            </Tooltip>
          </Flex>
        </Flex>

        {/* KPI Tiles */}
        <SimpleGrid columns={[1, 2, 4]} spacing={4} mb={6}>
          {kpiData.map((kpi) => (
            <Card
              key={kpi.label}
              bgGradient={`linear(to-r, ${kpi.colorFrom}, ${kpi.colorTo})`}
              color="white"
              boxShadow="lg"
              borderRadius="lg"
              _hover={{ transform: "scale(1.02)", boxShadow: "xl" }}
              transition="all 0.18s"
            >
              <CardBody>
                <Flex align="center" gap={4}>
                  <Box flex="1">
                    <Stat>
                      <StatLabel>{kpi.label}</StatLabel>
                      <StatNumber>{kpi.value}</StatNumber>
                      <StatHelpText>{kpi.description}</StatHelpText>
                    </Stat>
                  </Box>

                  {kpi.trend && (
                    <Box w="120px">
                      <Sparklines data={kpi.trend} svgWidth={120} svgHeight={40}>
                        <SparklinesLine color="rgba(255,255,255,0.9)" style={{ strokeWidth: 2 }} />
                      </Sparklines>
                    </Box>
                  )}
                </Flex>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Main Content */}
        <Grid templateColumns={["1fr", "1fr", "2fr 1fr"]} gap={6}>
          {/* Left Column */}
          <VStack spacing={6} align="stretch">
            {/* Compliance Standards */}
            <Card bg={cardBg} boxShadow="sm" borderRadius="lg">
              <CardHeader borderBottom="1px solid" borderColor={borderColor}>
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={3}>
                    <Avatar size="sm" bg="transparent" icon={<FiShield />} />
                    <Heading size="md">Compliance Standards</Heading>
                  </Flex>
                  <Tooltip label="Compliance standards coverage">
                    <FiInfo color={useColorModeValue("gray.600", "gray.300")} />
                  </Tooltip>
                </Flex>
              </CardHeader>

              <CardBody>
                {dashboardData.complianceStandards.length > 0 ? (
                  <List spacing={4}>
                    {dashboardData.complianceStandards.map((standard) => (
                      <ListItem key={standard.id}>
                        <Flex justify="space-between" align="center" mb={2}>
                          <Box>
                            <Text fontWeight="600">{standard.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              Updated: {new Date(standard.updated_at).toLocaleDateString()}
                            </Text>
                          </Box>

                          <HStack spacing={3}>
                            <Badge
                              colorScheme={standard.progress > 70 ? "green" : standard.progress > 40 ? "yellow" : "red"}
                              px={3}
                              py={1}
                              borderRadius="md"
                            >
                              {standard.progress}%
                            </Badge>
                          </HStack>
                        </Flex>

                        <Progress
                          value={standard.progress}
                          size="sm"
                          colorScheme={standard.progress > 70 ? "green" : standard.progress > 40 ? "yellow" : "red"}
                          borderRadius="full"
                          bg={progressBg}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text color="gray.500" textAlign="center" py={6}>
                    No compliance standards configured
                  </Text>
                )}
              </CardBody>

              <CardFooter borderTop="1px solid" borderColor={borderColor}>
                <Text fontSize="sm" color="gray.500">
                  {dashboardData.complianceStandards.length} standards being tracked
                </Text>
                <Spacer />
                <Tag size="sm" colorScheme="blue">
                  <FiTrendingUp style={{ marginRight: 6 }} /> Overall +7%
                </Tag>
              </CardFooter>
            </Card>

            {/* Policies by Region */}
            <Card bg={cardBg} boxShadow="sm" borderRadius="lg">
              <CardHeader borderBottom="1px solid" borderColor={borderColor}>
                <Flex align="center" gap={3}>
                  <Avatar size="sm" bg="transparent" icon={<FiGlobe />} />
                  <Heading size="md">Policies by Region</Heading>
                </Flex>
              </CardHeader>

              <CardBody>
                {dashboardData.policiesByRegion.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {dashboardData.policiesByRegion.map((region) => (
                      <Box key={region.region}>
                        <Flex justify="space-between" mb={1}>
                          <Text fontWeight="600">{region.region}</Text>
                          <Text fontWeight="700">{region.count} policies</Text>
                        </Flex>

                        <Tooltip label={`${region.count} / ${dashboardData.activePolicies} policies`}>
                          <Progress
                            value={(dashboardData.activePolicies ? (region.count / dashboardData.activePolicies) * 100 : 0)}
                            size="sm"
                            colorScheme="blue"
                            borderRadius="full"
                            bg={progressBg}
                          />
                        </Tooltip>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500" textAlign="center" py={6}>
                    No regional policies data available
                  </Text>
                )}
              </CardBody>

              <CardFooter borderTop="1px solid" borderColor={borderColor}>
                <SimpleGrid columns={2} spacing={3} w="100%">
                  {dashboardData.policiesByRegion.slice(0, 4).map((region) => (
                    <Flex key={region.region} align="center">
                      <Box w="10px" h="10px" bg="blue.500" borderRadius="full" mr={3} />
                      <Text fontSize="sm">
                        {region.region}: <strong>{region.count}</strong>
                      </Text>
                    </Flex>
                  ))}
                </SimpleGrid>
              </CardFooter>
            </Card>
          </VStack>

          {/* Right Column */}
          <VStack spacing={6} align="stretch">
            {/* Evidence Status */}
            <Card bg={cardBg} boxShadow="sm" borderRadius="lg">
              <CardHeader borderBottom="1px solid" borderColor={borderColor}>
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={3}>
                    <Avatar size="sm" bg="transparent" icon={<FiDatabase />} />
                    <Heading size="md">Evidence Status</Heading>
                  </Flex>
                  <Tooltip label="Evidence collection progress">
                    <FiInfo color={useColorModeValue("gray.600", "gray.300")} />
                  </Tooltip>
                </Flex>
              </CardHeader>

              <CardBody>
                <Flex direction={isMobile ? "column" : "row"} align="center" justify="space-around" gap={6}>
                  <Box position="relative" w="140px" h="140px">
                    <Box
                      w="100%"
                      h="100%"
                      borderRadius="full"
                      border="10px solid"
                      borderColor={progressBg}
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        w="100%"
                        h={`${
                          (dashboardData.evidenceStatus.valid /
                            (dashboardData.evidenceStatus.valid +
                              dashboardData.evidenceStatus.expired +
                              dashboardData.evidenceStatus.pendingReview ||
                              1)) *
                          100
                        }%`}
                        bg="green.500"
                      />
                      <Flex position="absolute" top="0" left="0" w="100%" h="100%" align="center" justify="center" direction="column">
                        <Text fontSize="2xl" fontWeight="bold">
                          {Math.round(
                            (dashboardData.evidenceStatus.valid /
                              (dashboardData.evidenceStatus.valid +
                                dashboardData.evidenceStatus.expired +
                                dashboardData.evidenceStatus.pendingReview ||
                                1)) *
                              100
                          )}
                          %
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Complete
                        </Text>
                      </Flex>
                    </Box>
                  </Box>

                  <VStack spacing={3} align="stretch" flex="1">
                    <Stat>
                      <StatLabel>Valid Evidence</StatLabel>
                      <StatNumber>{dashboardData.evidenceStatus.valid}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        {Math.floor(dashboardData.evidenceStatus.valid * 0.1)} since last week
                      </StatHelpText>
                      <Box w="100px" mt={2}>
                        <Sparklines data={dashboardData.trends.evidenceValid} svgWidth={100} svgHeight={20}>
                          <SparklinesLine color="green" />
                        </Sparklines>
                      </Box>
                    </Stat>

                    <Stat>
                      <StatLabel>Expired Evidence</StatLabel>
                      <StatNumber>{dashboardData.evidenceStatus.expired}</StatNumber>
                      <StatHelpText>
                        <StatArrow type={dashboardData.evidenceStatus.expired > 0 ? "decrease" : "increase"} />
                        {dashboardData.evidenceStatus.expired > 0 ? "Needs renewal" : "Up to date"}
                      </StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel>Pending Review</StatLabel>
                      <StatNumber>{dashboardData.evidenceStatus.pendingReview}</StatNumber>
                    </Stat>
                  </VStack>
                </Flex>
              </CardBody>

              <CardFooter borderTop="1px solid" borderColor={borderColor}>
                <Text fontSize="sm" color="gray.500">
                  Next evidence audit in 14 days
                </Text>
              </CardFooter>
            </Card>

            {/* Pending Tasks */}
            <Card bg={cardBg} boxShadow="sm" borderRadius="lg">
              <CardHeader borderBottom="1px solid" borderColor={borderColor}>
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={3}>
                    <Avatar size="sm" bg="transparent" icon={<FiAlertCircle />} />
                    <Heading size="md">Pending Tasks</Heading>
                  </Flex>
                  <Tooltip label="Tasks that require your attention">
                    <FiInfo color={useColorModeValue("gray.600", "gray.300")} />
                  </Tooltip>
                </Flex>
              </CardHeader>

              <CardBody>
                {dashboardData.pendingTasksList.length > 0 ? (
                  <List spacing={3}>
                    {dashboardData.pendingTasksList.map((task) => {
                      const due = task?.due_date ? new Date(task.due_date).getTime() : null;
                      const isOverdue = due ? due < now : false;

                      return (
                        <ListItem key={task.id}>
                          <Flex justify="space-between" align="center" gap={3}>
                            <Box>
                              <Text fontWeight="600">{task.title}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {task?.assigned_to ? `Assigned to ${task.assigned_to}` : ""}
                                {task?.due_date ? ` • Due ${new Date(task.due_date).toLocaleDateString()}` : ""}
                              </Text>
                            </Box>

                            <HStack spacing={3}>
                              {isOverdue && (
                                <Tooltip label="Task is overdue">
                                  <Badge colorScheme="red">Overdue</Badge>
                                </Tooltip>
                              )}

                              <Tooltip label={task?.description || "No details"}>
                                <Tag size="sm" colorScheme={getPriorityColor(task.priority)}>
                                  {task.priority || "normal"}
                                </Tag>
                              </Tooltip>
                            </HStack>
                          </Flex>
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Text color="gray.500" textAlign="center" py={6}>
                    No pending tasks
                  </Text>
                )}
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </Box>
    </ProtectedRoute>
  );
};

export default Dashboard;
