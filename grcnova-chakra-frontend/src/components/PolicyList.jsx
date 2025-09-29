import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Text,
  HStack,
  Icon,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Badge
} from '@chakra-ui/react'
import { supabase } from '../supabase'
import { FiFile, FiDownload, FiTrash2, FiUser } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const PolicyList = () => {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchPolicies()
    setupRealtimeSubscription()
  }, [])

  const fetchPolicies = async () => {
    try {
      // First fetch all policies
      const { data: policiesData, error: policiesError } = await supabase
        .from('uploaded_policies')
        .select('*')
        .order('created_at', { ascending: false })

      if (policiesError) throw policiesError

      // If no policies, set empty array and return
      if (!policiesData || policiesData.length === 0) {
        setPolicies([])
        setLoading(false)
        return
      }

      // Get unique user IDs from policies
      const userIds = [...new Set(policiesData.map(policy => policy.uploaded_by))]

      // Fetch user data for all users who uploaded policies
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)

      if (usersError) throw usersError

      // Combine policy data with user data
      const policiesWithUsers = policiesData.map(policy => ({
        ...policy,
        profiles: usersData.find(user => user.id === policy.uploaded_by) || null
      }))

      setPolicies(policiesWithUsers)
    } catch (error) {
      toast({
        title: 'Error fetching policies',
        description: error.message,
        status: 'error',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('policies-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uploaded_policies'
        },
        (payload) => {
          console.log('Real-time update received:', payload)
          fetchPolicies() // Refresh the list
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const handleDelete = async (policyId, fileUrl) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return
    }

    try {
      // Extract file path from URL
      const filePath = fileUrl.split('/').pop()
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('policies')
        .remove([filePath]) // Just use the file name, not the full path

      if (storageError) {
        console.warn('Storage delete error (may already be deleted):', storageError)
        // Continue with database deletion even if storage fails
      }
      
      // Delete record from database
      const { error: dbError } = await supabase
        .from('uploaded_policies')
        .delete()
        .eq('id', policyId)

      if (dbError) throw dbError

      toast({
        title: 'Policy deleted successfully',
        status: 'success',
        duration: 3000
      })
    } catch (error) {
      toast({
        title: 'Error deleting policy',
        description: error.message,
        status: 'error',
        duration: 5000
      })
    }
  }

  const canDeletePolicy = (policyUserId) => {
    // Allow users to delete their own policies or admins to delete any policy
    return user && (user.id === policyUserId || user.role === 'admin' || user.role === 'super_admin')
  }

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading policies...</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Uploaded Policies
      </Text>

      {policies.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          No policies uploaded yet. Upload your first policy above.
        </Alert>
      ) : (
        <VStack spacing={4} align="stretch">
          {policies.map((policy) => (
            <Box
              key={policy.id}
              p={4}
              borderWidth={1}
              borderRadius="lg"
              boxShadow="sm"
            >
              <HStack justify="space-between" align="start">
                <HStack align="start" spacing={4} flex={1}>
                  <Icon as={FiFile} w={6} h={6} color="blue.500" mt={1} />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="bold">{policy.title}</Text>
                    {policy.description && (
                      <Text fontSize="sm" color="gray.600">
                        {policy.description}
                      </Text>
                    )}
                    <HStack spacing={2} mt={1}>
                      <Badge colorScheme="blue">{policy.file_type}</Badge>
                      <Text fontSize="xs" color="gray.500">
                        {(policy.file_size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(policy.created_at).toLocaleDateString()}
                      </Text>
                    </HStack>
                    {policy.profiles && (
                      <HStack spacing={1} mt={1}>
                        <Icon as={FiUser} w={3} h={3} color="gray.500" />
                        <Text fontSize="xs" color="gray.500">
                          Uploaded by: {policy.profiles.full_name || policy.profiles.email}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </HStack>

                <HStack spacing={2}>
                  <Button
                    as="a"
                    href={policy.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    leftIcon={<FiDownload />}
                    colorScheme="blue"
                    variant="outline"
                  >
                    View
                  </Button>
                  {canDeletePolicy(policy.uploaded_by) && (
                    <Button
                      size="sm"
                      leftIcon={<FiTrash2 />}
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDelete(policy.id, policy.file_url)}
                    >
                      Delete
                    </Button>
                  )}
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  )
}

export default PolicyList