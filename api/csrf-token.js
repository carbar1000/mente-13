import { v4 as uuidv4 } from 'uuid';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const csrfToken = uuidv4();

    // Set the CSRF token as a cookie
    res.setHeader('Set-Cookie', serialize('csrf_token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    }));

    // Return the CSRF token in the response
    res.status(200).json({ csrfToken });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
