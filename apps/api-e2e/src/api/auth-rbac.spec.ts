import axios from 'axios';

const API = '/api';

describe('Auth and RBAC (e2e)', () => {
  let ownerToken: string;
  let viewerToken: string;
  let adminToken: string;
  let taskId: string;

  beforeAll(async () => {
    const login = async (email: string, password: string) => {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      return res.data.access_token;
    };
    ownerToken = await login('admin@example.com', 'admin123');
    viewerToken = await login('viewer@example.com', 'admin123');
    adminToken = await login('admin2@example.com', 'admin123');
  });

  describe('Login', () => {
    it('should return token for valid credentials', async () => {
      const res = await axios.post(`${API}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123',
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('access_token');
      expect(res.data).toHaveProperty('user');
      expect(res.data.user.email).toBe('admin@example.com');
      expect(res.data.user.role).toBe('Owner');
    });

    it('should return 401 for invalid credentials', async () => {
      await expect(
        axios.post(`${API}/auth/login`, { email: 'wrong@example.com', password: 'wrong' })
      ).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  describe('GET /tasks (org-scoped)', () => {
    it('should return tasks for authenticated Owner', async () => {
      const res = await axios.get(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      if (res.data.length > 0) taskId = res.data[0].id;
    });

    it('should return 401 without token', async () => {
      await expect(axios.get(`${API}/tasks`)).rejects.toMatchObject({
        response: { status: 401 },
      });
    });
  });

  describe('Viewer permissions', () => {
    it('should allow Viewer to GET /tasks', async () => {
      const res = await axios.get(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${viewerToken}` },
      });
      expect(res.status).toBe(200);
    });

    it('should forbid Viewer from POST /tasks', async () => {
      await expect(
        axios.post(
          `${API}/tasks`,
          { title: 'Test', status: 'Todo', category: 'Work' },
          { headers: { Authorization: `Bearer ${viewerToken}` } }
        )
      ).rejects.toMatchObject({ response: { status: 403 } });
    });

    it('should forbid Viewer from GET /audit-log', async () => {
      await expect(
        axios.get(`${API}/audit-log`, {
          headers: { Authorization: `Bearer ${viewerToken}` },
        })
      ).rejects.toMatchObject({ response: { status: 403 } });
    });
  });

  describe('Admin permissions', () => {
    it('should allow Admin to create task', async () => {
      const res = await axios.post(
        `${API}/tasks`,
        { title: 'Admin task', status: 'Todo', category: 'Work' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      expect(res.status).toBe(200);
      expect(res.data.title).toBe('Admin task');
    });

    it('should forbid Admin from GET /audit-log', async () => {
      await expect(
        axios.get(`${API}/audit-log`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      ).rejects.toMatchObject({ response: { status: 403 } });
    });
  });

  describe('Owner permissions', () => {
    it('should allow Owner to GET /audit-log', async () => {
      const res = await axios.get(`${API}/audit-log`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('entries');
      expect(res.data).toHaveProperty('total');
    });
  });
});
