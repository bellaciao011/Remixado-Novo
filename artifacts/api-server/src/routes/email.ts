import { Router, Request, Response } from 'express';
import { sendTestEmail } from '../email/emailService';

const router = Router();

if (process.env.NODE_ENV !== 'production') {
  router.get('/email/test', async (req: Request, res: Response): Promise<void> => {
    const { email, template } = req.query;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Query param "email" is required' });
      return;
    }

    const templateNum = template ? parseInt(template as string, 10) : 1;
    if (isNaN(templateNum) || templateNum < 1 || templateNum > 16) {
      res.status(400).json({ error: 'Query param "template" must be between 1 and 16' });
      return;
    }

    try {
      await sendTestEmail(templateNum, email);
      res.json({
        ok: true,
        message: `Template ${templateNum} sent to ${email}`,
        templates: {
          1: 'Confirmação de pedido',
          2: 'Confirmação de upsell',
          '3-16': 'E-mails de logística (steps 1-14)',
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to send test email' });
    }
  });
}

export default router;
