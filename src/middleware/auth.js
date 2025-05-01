/**
 * Mock authentication middleware
 * In a real application, this would validate tokens, check permissions, etc.
 * For this mock version, it simply passes through all requests as authenticated
 */
export const authenticate = (req, res, next) => {
  // For mock development purposes, we're allowing all requests through
  // In a real application, this would verify JWT tokens, API keys, etc.

  // Adding a mock user to the request object
  req.user = {
    id: 1,
    email: 'admin@example.com',
    role: 'admin',
  };

  next();
};
