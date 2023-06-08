import axios from 'axios';

export default async function handler(req, res) {
  const { url } = req.query;

  try {
    const response = await axios.get(url, { responseType: 'blob' });
    res.setHeader('Content-Type', 'application/octet-stream');
    res.status(200).send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
