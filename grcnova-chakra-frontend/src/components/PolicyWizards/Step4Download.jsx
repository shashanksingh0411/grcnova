import { savePolicy } from '../../../lib/supabase/api/policies';

const Step4Download = ({ templateId, variables }) => {
  const handleDownload = async () => {
    try {
      // 1. Save to Supabase
      const user = supabase.auth.user();
      const { id: policyId } = await savePolicy(user.id, templateId, variables);

      // 2. Call backend to generate document
      const response = await fetch(
        '/functions/generate-policy', // or your Express.js route
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ template_id: templateId, variables }),
        }
      );
      const { content } = await response.json();

      // 3. Download as file
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `policy-${policyId}.md`;
      a.click();
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  return (
    <Button colorScheme="blue" onClick={handleDownload}>
      Download Policy
    </Button>
  );
};