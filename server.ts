import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db';

import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || 'brandflow_studio_jwt_secret_key_2026';

// Helper to generate auth token
function generateToken(user: any): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Auth middleware to attach authenticated user
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (req as any).user = decoded;
    } catch (err) {
      // invalid or expired token
    }
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(authMiddleware);

  // --- Authentication Routes ---
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
      }

      const user = db.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ error: 'بيانات الاعتماد غير صحيحة، يرجى التأكد من البريد وكلمة المرور' });
      }

      const token = generateToken(user);
      res.json({ user, token });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'فشل تسجيل الدخول' });
    }
  });

  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, role, title } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'الاسم والبريد وكلمة المرور حقول إلزامية' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف' });
      }

      const user = db.registerUser({ name, email, password, role: role || 'member', title });
      const token = generateToken(user);
      res.status(201).json({ user, token });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'فشل إنشاء الحساب' });
    }
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني' });
      }

      const resetInfo = db.createPasswordResetToken(email);
      if (!resetInfo) {
        return res.status(404).json({ error: 'لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني' });
      }

      res.json({
        success: true,
        message: 'تم توليد رابط ورمز استعادة كلمة المرور بنجاح',
        token: resetInfo.token,
        email: resetInfo.email,
        expiresAt: resetInfo.expiresAt,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'فشل معالجة طلب استعادة كلمة المرور' });
    }
  });

  app.post('/api/auth/reset-password', (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'رمز الاستعادة وكلمة المرور الجديدة مطلوبان' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف' });
      }

      const success = db.resetPasswordWithToken(token, newPassword);
      if (!success) {
        return res.status(400).json({ error: 'رمز الاستعادة غير صالح أو منتهي الصلاحية' });
      }

      res.json({ success: true, message: 'تم تعيين كلمة المرور الجديدة بنجاح، يمكنك الآن تسجيل الدخول' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'فشل تحديث كلمة المرور' });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const userPayload = (req as any).user;
    if (!userPayload || !userPayload.id) {
      return res.status(401).json({ error: 'غير مصرح - يرجى تسجيل الدخول' });
    }

    const user = db.getUserById(userPayload.id);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json(user);
  });

  app.get('/api/auth/users', (req, res) => {
    const users = db.getAllUsers();
    res.json(users);
  });

  app.put('/api/auth/users/:id/role', (req, res) => {
    const currentUser = (req as any).user;
    if (currentUser && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'هذا الإجراء يتطلب صلاحية مدير النظام (Admin)' });
    }

    const { role } = req.body;
    if (role !== 'admin' && role !== 'member') {
      return res.status(400).json({ error: 'نوع الصلاحية غير صالح' });
    }

    const updated = db.updateUserRole(req.params.id, role);
    if (!updated) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json(updated);
  });

  // --- API Routes ---

  // Dashboard Stats
  app.get('/api/stats', (req, res) => {
    try {
      const stats = db.getDashboardMetrics();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: 'Failed to calculate stats' });
    }
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    res.json(db.getSettings());
  });

  app.put('/api/settings', (req, res) => {
    try {
      const updated = db.updateSettings(req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // Clients
  app.get('/api/clients', (req, res) => {
    res.json(db.getClients());
  });

  app.post('/api/clients', (req, res) => {
    try {
      const client = db.createClient(req.body);
      res.status(201).json(client);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create client' });
    }
  });

  app.put('/api/clients/:id', (req, res) => {
    const updated = db.updateClient(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Client not found' });
    res.json(updated);
  });

  app.delete('/api/clients/:id', (req, res) => {
    const result = db.deleteClient(req.params.id);
    res.json(result);
  });

  // Projects
  app.get('/api/projects', (req, res) => {
    res.json(db.getProjects());
  });

  app.get('/api/projects/:id', (req, res) => {
    const project = db.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  });

  app.post('/api/projects', (req, res) => {
    try {
      const project = db.createProject(req.body);
      res.status(201).json(project);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  app.put('/api/projects/:id', (req, res) => {
    const updated = db.updateProject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json(updated);
  });

  app.delete('/api/projects/:id', (req, res) => {
    const result = db.deleteProject(req.params.id);
    res.json(result);
  });

  app.post('/api/projects/:id/stage', (req, res) => {
    const { stageIndex, isCompleted } = req.body;
    const project = db.updateProjectStage(req.params.id, Number(stageIndex), Boolean(isCompleted));
    if (!project) return res.status(404).json({ error: 'Project or stage not found' });
    res.json(project);
  });

  // Proposals
  app.get('/api/proposals', (req, res) => {
    res.json(db.getProposals());
  });

  app.get('/api/proposals/:id', (req, res) => {
    const prop = db.getProposalById(req.params.id);
    if (!prop) return res.status(404).json({ error: 'Proposal not found' });
    res.json(prop);
  });

  app.get('/api/proposals/token/:token', (req, res) => {
    const prop = db.getProposalByToken(req.params.token);
    if (!prop) return res.status(404).json({ error: 'Proposal not found' });
    const client = db.getClientById(prop.clientId);
    const settings = db.getSettings();
    res.json({ proposal: prop, client, studio: settings });
  });

  app.post('/api/proposals', (req, res) => {
    try {
      const prop = db.createProposal(req.body);
      res.status(201).json(prop);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create proposal' });
    }
  });

  app.put('/api/proposals/:id', (req, res) => {
    const updated = db.updateProposal(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Proposal not found' });
    res.json(updated);
  });

  app.delete('/api/proposals/:id', (req, res) => {
    const result = db.deleteProposal(req.params.id);
    res.json(result);
  });

  app.post('/api/proposals/:id/accept', (req, res) => {
    const { signeeName } = req.body;
    if (!signeeName) return res.status(400).json({ error: 'اسم الموقع مطلوب لتأكيد الاعتماد' });
    const result = db.acceptProposal(req.params.id, signeeName);
    if (!result) return res.status(404).json({ error: 'Proposal not found' });
    res.json(result);
  });

  // Invoices & Payments
  app.get('/api/invoices', (req, res) => {
    res.json(db.getInvoices());
  });

  app.get('/api/invoices/:id', (req, res) => {
    const inv = db.getInvoiceById(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    res.json(inv);
  });

  app.get('/api/invoices/token/:token', (req, res) => {
    const inv = db.getInvoiceByToken(req.params.token);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    const client = db.getClientById(inv.clientId);
    const settings = db.getSettings();
    res.json({ invoice: inv, client, studio: settings });
  });

  app.post('/api/invoices', (req, res) => {
    try {
      const inv = db.createInvoice(req.body);
      res.status(201).json(inv);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  });

  app.post('/api/invoices/:id/payment', (req, res) => {
    const result = db.recordPayment(req.params.id, req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.delete('/api/invoices/:id', (req, res) => {
    const result = db.deleteInvoice(req.params.id);
    res.json(result);
  });

  // Agreements
  app.get('/api/agreements', (req, res) => {
    res.json(db.getAgreements());
  });

  app.get('/api/agreements/:id', (req, res) => {
    const agr = db.getAgreementById(req.params.id);
    if (!agr) return res.status(404).json({ error: 'Agreement not found' });
    res.json(agr);
  });

  app.post('/api/agreements', (req, res) => {
    try {
      const agr = db.createAgreement(req.body);
      res.status(201).json(agr);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create agreement' });
    }
  });

  app.post('/api/agreements/:id/sign', (req, res) => {
    const { signeeName } = req.body;
    if (!signeeName) return res.status(400).json({ error: 'اسم الموقع مطلوب' });
    const agr = db.signAgreement(req.params.id, signeeName);
    if (!agr) return res.status(404).json({ error: 'Agreement not found' });
    res.json(agr);
  });

  app.delete('/api/agreements/:id', (req, res) => {
    const result = db.deleteAgreement(req.params.id);
    res.json(result);
  });

  // Brief Forms & Submissions
  app.get('/api/brief-forms', (req, res) => {
    res.json(db.getBriefForms());
  });

  app.get('/api/brief-forms/:id', (req, res) => {
    const form = db.getBriefFormById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Brief form not found' });
    res.json(form);
  });

  app.get('/api/brief-forms/token/:token', (req, res) => {
    const form = db.getBriefFormByToken(req.params.token);
    if (!form) return res.status(404).json({ error: 'Brief form not found' });
    const settings = db.getSettings();
    const submission = form.submissionId ? db.getBriefSubmissionById(form.submissionId) : null;
    res.json({ form, studio: settings, submission });
  });

  app.post('/api/brief-forms', (req, res) => {
    try {
      const form = db.createBriefForm(req.body);
      res.status(201).json(form);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create brief form' });
    }
  });

  app.delete('/api/brief-forms/:id', (req, res) => {
    const result = db.deleteBriefForm(req.params.id);
    res.json(result);
  });

  app.post('/api/brief-forms/:id/submit', (req, res) => {
    const { answers, clientName, clientEmail, clientCompany } = req.body;
    if (!clientName || !clientEmail) {
      return res.status(400).json({ error: 'اسم العميل والبريد الإلكتروني مطلوبان' });
    }
    const sub = db.submitBriefAnswers(req.params.id, answers, clientName, clientEmail, clientCompany);
    if (!sub) return res.status(404).json({ error: 'Brief form not found' });
    res.status(201).json(sub);
  });

  app.get('/api/brief-submissions', (req, res) => {
    res.json(db.getBriefSubmissions());
  });

  // Research Workspace & PDF Data
  app.get('/api/research/:projectId', (req, res) => {
    let research = db.getResearchByProjectId(req.params.projectId);
    if (!research) {
      research = db.saveResearch(req.params.projectId, {});
    }
    res.json(research);
  });

  app.put('/api/research/:projectId', (req, res) => {
    try {
      const updated = db.saveResearch(req.params.projectId, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save research' });
    }
  });

  // Moodboard
  app.get('/api/moodboard/:projectId', (req, res) => {
    const mb = db.getMoodboardByProjectId(req.params.projectId);
    res.json(mb || null);
  });

  app.put('/api/moodboard/:projectId', (req, res) => {
    try {
      const mb = db.saveMoodboard(req.params.projectId, req.body);
      res.json(mb);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save moodboard' });
    }
  });

  app.post('/api/moodboard/:projectId/approve', (req, res) => {
    const { directionId, notes } = req.body;
    const mb = db.approveMoodboardDirection(req.params.projectId, directionId, notes);
    if (!mb) return res.status(404).json({ error: 'Moodboard or project not found' });
    res.json(mb);
  });

  // Revisions
  app.get('/api/revisions/:projectId', (req, res) => {
    res.json(db.getRevisionsByProjectId(req.params.projectId));
  });

  app.post('/api/revisions/:projectId', (req, res) => {
    try {
      const rev = db.createRevision({ ...req.body, projectId: req.params.projectId });
      res.status(201).json(rev);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create revision request' });
    }
  });

  // Deliverables
  app.get('/api/deliverables/:projectId', (req, res) => {
    res.json(db.getDeliverablesByProjectId(req.params.projectId));
  });

  app.post('/api/deliverables/:projectId', (req, res) => {
    try {
      const del = db.createDeliverable({ ...req.body, projectId: req.params.projectId });
      res.status(201).json(del);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add deliverable' });
    }
  });

  // Activities
  app.get('/api/activities', (req, res) => {
    res.json(db.getActivities(30));
  });

  // Client Portal Bundle
  app.get('/api/portal/:token', (req, res) => {
    const bundle = db.getClientPortalData(req.params.token);
    if (!bundle) return res.status(404).json({ error: 'رابط البوابة غير صالح أو منتهي الصلاحية' });
    res.json(bundle);
  });

  // --- Vite Middleware in Development / Static in Production ---
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BrandFlow Studio Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start BrandFlow server:', err);
});
