import { supabase } from '../../supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { title, description, fileName, fileSize, fileType, fileUrl, userId } = req.body

    const { data, error } = await supabase
      .from('uploaded_policies')
      .insert([
        {
          title,
          description,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          file_url: fileUrl,
          uploaded_by: userId
        }
      ])
      .select()

    if (error) {
      throw error
    }

    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}