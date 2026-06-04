import { Router, Request, Response } from 'express';
import { sendTestEmail } from '../email/emailService';

const router = Router();

if (process.env.NODE_ENV !== 'production') {
  router.get('/email/test', async (req: Request, res: Response): Promise<void> => {
    const { email, template, locale } = req.query;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Query param "email" is required' });
      return;
    }

    const templateNum = template ? parseInt(template as string, 10) : 1;
    if (isNaN(templateNum) || templateNum < 1 || templateNum > 16) {
      res.status(400).json({ error: 'Query param "template" must be between 1 and 16' });
      return;
    }

    const localeStr = typeof locale === 'string' ? locale : 'pt-BR';

    try {
      await sendTestEmail(templateNum, email, localeStr);
      res.json({
        ok: true,
        message: `Template ${templateNum} sent to ${email} (locale: ${localeStr})`,
        templates: {
          1: 'Order confirmation',
          2: 'Upsell confirmation',
          '3-16': 'Logistics emails (steps 1-14)',
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to send test email' });
    }
  });
}

export default router;
