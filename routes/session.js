import express from 'express';

const router = express.Router();

// model
import Session from '../models/Session.js';

// middleware
import { isLoggedIn } from '../middleware/isLoggedIn.js';

router.get('/', isLoggedIn, async (req, res) => {
    const sessions = await Session.find({ userId: req.user._id });

    res.render('sessions', { sessions });
});

router.post('/logout-session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    
    const session = await Session.findOne({ sessionId, userId: req.user._id });
  
    if (session) {
      await Session.deleteOne({ sessionId });
  
      res.clearCookie('session_id');
      
      return res.json({ message: 'Session logged out successfully' });
    }
    
    res.status(400).json({ message: 'Session not found' });
  });


export default router;