import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

export const executeCode = async (req, res) => {
  try {
    const { language, code } = req.body;
    
    const response = await axios.post(`${PISTON_API_URL}/execute`, {
      language,
      version: '*',
      files: [{ content: code }]
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLanguages = async (req, res) => {
  try {
    const response = await axios.get(`${PISTON_API_URL}/runtimes`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};