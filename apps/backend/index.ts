import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { AuthService } from './services/auth';
import { dbService } from './services/database';

const app = new Hono();
const authService = new AuthService();

// Middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.get('/auth/google', (c) => {
  try {
    const authUrl = authService.getAuthUrl();
    return c.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return c.json({ error: 'Failed to generate auth URL' }, 500);
  }
});

app.post('/auth/google/callback', async (c) => {
  try {
    const { code } = await c.req.json();
    
    if (!code) {
      return c.json({ error: 'Authorization code is required' }, 400);
    }

    // Get user info from Google
    const googleUser = await authService.getGoogleUserInfo(code);
    
    // Check if user exists
    let user = await dbService.findUserByGoogleId(googleUser.id);
    
    if (!user) {
      // Create new user with Ethereum keypair
      const ethereumKeypair = authService.generateEthereumKeypair();
      
      user = await dbService.createUser({
        email: googleUser.email,
        googleId: googleUser.id,
        name: googleUser.name,
        avatar: googleUser.picture,
        encryptedPrivateKey: ethereumKeypair.encryptedPrivateKey,
        publicAddress: ethereumKeypair.address
      });
    } else {
      // Update last login
      await dbService.updateLastLogin(user.id);
    }

    // Generate JWT
    const token = authService.generateJWT(user.id, user.email);

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        publicAddress: user.publicAddress
      }
    });

  } catch (error) {
    console.error('Error in Google callback:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// Protected route middleware
const authMiddleware = async (c: any, next: any) => {
  try {
    const authorization = c.req.header('Authorization');
    
    if (!authorization) {
      return c.json({ error: 'Authorization header is required' }, 401);
    }

    const token = authorization.replace('Bearer ', '');
    const decoded = authService.verifyJWT(token);
    
    // Attach user info to context
    c.set('user', decoded);
    await next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Protected routes
app.get('/user/profile', authMiddleware, async (c) => {
  try {
    const userAuth = c.get('user');
    const user = await dbService.findUserById(userAuth.userId);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        publicAddress: user.publicAddress,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Error getting user profile:', error);
    return c.json({ error: 'Failed to get user profile' }, 500);
  }
});

// Get user's wallet private key (for frontend operations)
app.get('/user/wallet', authMiddleware, async (c) => {
  try {
    const userAuth = c.get('user');
    const user = await dbService.findUserById(userAuth.userId);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Decrypt private key
    const privateKey = authService.decryptPrivateKey(user.encryptedPrivateKey);

    return c.json({
      address: user.publicAddress,
      privateKey // Note: In production, consider more secure methods
    });

  } catch (error) {
    console.error('Error getting wallet info:', error);
    return c.json({ error: 'Failed to get wallet info' }, 500);
  }
});

// Error handling
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Start server
const port = process.env.PORT || 3001;

console.log(`🚀 Server starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};