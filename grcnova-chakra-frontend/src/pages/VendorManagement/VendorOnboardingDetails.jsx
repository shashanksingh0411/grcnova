import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Divider,
  Link,
  Badge,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { supabase } from "../../supabase";

const VendorOnboardingDetail = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        // 1. Fetch vendor basic info
        const { data: vendorData, error: vendorError } = await supabase
          .from("vendors")
          .select("*")
          .eq("id", id)
          .single();
        if (vendorError) throw vendorError;
        setVendor(vendorData);

        // 2. Fetch vendor documents
        const { data: docData, error: docError } = await supabase
          .from("vendor_documents")
          .select("*")
          .eq("vendor_id", id);
        if (docError) throw docError;
        setDocuments(docData);

        // 3. Fetch onboarding form JSON
        // 3. Fetch onboarding form JSON
const { data: formData, error: formError } = await supabase
  .from("vendor_onboarding_forms")
  .select("*")
  .eq("vendor_id", id)
  .maybeSingle();  // <-- safer, returns null instead of error

if (formError) throw formError;
setForm(formData);

      } catch (err) {
        console.error("Error fetching vendor onboarding details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id]);

  if (loading) {
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" />
        <Text mt={4}>Loading vendor details...</Text>
      </Box>
    );
  }

  if (!vendor) {
    return (
      <Box textAlign="center" mt={20}>
        <Text>Vendor not found</Text>
      </Box>
    );
  }

  return (
    <Box maxW="6xl" mx="auto" py={8}>
      <Heading size="lg" mb={6}>
        Vendor Onboarding Summary
      </Heading>

      {/* Vendor Info */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Vendor Information</Heading>
        </CardHeader>
        <CardBody>
          <VStack align="start" spacing={2}>
            <Text><b>Name:</b> {vendor.name}</Text>
            <Text><b>Contact Person:</b> {vendor.contact_person}</Text>
            <Text><b>Email:</b> {vendor.email}</Text>
            <Text><b>Phone:</b> {vendor.phone}</Text>
            <Text>
              <b>Status:</b>{" "}
              <Badge colorScheme={vendor.status === "completed" ? "green" : "orange"}>
                {vendor.status}
              </Badge>
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Vendor Documents */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Uploaded Documents</Heading>
        </CardHeader>
        <CardBody>
          {documents.length > 0 ? (
            <VStack align="start" spacing={3}>
              {documents.map((doc) => (
                <HStack key={doc.id} spacing={4}>
                  <Text>{doc.file_name}</Text>
                  <Link href={doc.file_url} color="blue.500" isExternal>
                    View
                  </Link>
                </HStack>
              ))}
            </VStack>
          ) : (
            <Text>No documents uploaded.</Text>
          )}
        </CardBody>
      </Card>

      {/* Onboarding Form Responses */}
      <Card>
        <CardHeader>
          <Heading size="md">Onboarding Form Responses</Heading>
        </CardHeader>
        <CardBody>
          {form && form.form_data ? (
            <VStack align="start" spacing={6} w="100%">
              {[
                {
                  step: "Step 1: Basic Info",
                  fields: ["companyName", "industry", "location", "primaryContact"],
                },
                {
                  step: "Step 2: Compliance Details",
                  fields: ["certifications", "compliancePolicies", "riskAssessment"],
                },
                {
                  step: "Step 3: Security Practices",
                  fields: ["dataProtection", "accessControls", "incidentResponse"],
                },
                {
                  step: "Step 4: Other Information",
                  fields: ["additionalNotes"],
                },
              ].map(({ step, fields }) => (
                <Box key={step} w="100%">
                  <Text fontWeight="bold" fontSize="lg" mb={3}>
                    {step}
                  </Text>
                  <VStack align="start" spacing={3} pl={4}>
                    {fields.map((field) => {
                      const value = form.form_data[field];

                      // Handle nested objects
                      if (typeof value === "object" && value !== null) {
                        return (
                          <Box key={field} w="100%">
                            <Text fontWeight="semibold" mb={1}>
                              {field.replace(/([A-Z])/g, " $1")}
                            </Text>
                            <VStack align="start" pl={4} spacing={1}>
                              {Object.entries(value).map(([subKey, subValue]) => (
                                <HStack key={subKey} spacing={2}>
                                  <Text fontWeight="semibold">
                                    {subKey.replace(/([A-Z])/g, " $1")}:
                                  </Text>
                                  <Text>{subValue || "N/A"}</Text>
                                </HStack>
                              ))}
                            </VStack>
                          </Box>
                        );
                      }

                      // Simple key-value
                      if (value !== undefined) {
                        return (
                          <HStack key={field} spacing={2} w="100%">
                            <Text fontWeight="semibold">
                              {field.replace(/([A-Z])/g, " $1")}:
                            </Text>
                            <Text>{value || "N/A"}</Text>
                          </HStack>
                        );
                      }

                      return null;
                    })}
                  </VStack>
                  <Divider my={4} />
                </Box>
              ))}
            </VStack>
          ) : (
            <Text>No onboarding form submitted.</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};

export default VendorOnboardingDetail;
