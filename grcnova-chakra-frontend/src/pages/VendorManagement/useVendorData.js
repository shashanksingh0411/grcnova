// hooks/useVendorData.js
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export default function useVendorData(vendorId) {
  const [vendor, setVendor] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) return;

    const fetchVendorData = async () => {
      setLoading(true);

      // Fetch vendor details
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId)
        .single();

      if (vendorError) {
        console.error("Error fetching vendor:", vendorError);
        setLoading(false);
        return;
      }

      setVendor(vendorData);

      // Fetch latest onboarding form
      const { data: form, error: formError } = await supabase
        .from("vendor_onboarding_forms")
        .select("form_data")
        .eq("vendor_id", vendorId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (formError) {
        console.error("Error fetching form:", formError);
      } else {
        setFormData(form?.form_data || null);
      }

      setLoading(false);
    };

    fetchVendorData();
  }, [vendorId]);

  return { vendor, formData, loading };
}
