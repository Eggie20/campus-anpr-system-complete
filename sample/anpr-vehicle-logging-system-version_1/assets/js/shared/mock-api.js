/**
 * Mock API
 * Simulated backend with sample data for frontend development
 */

const MockAPI = {
  // Simulate network delay (ms)
  delay: 300,

  /**
   * Sample data store
   */
  data: {
    users: [
      { id: 1, name: 'Admin User', email: 'admin@csu.edu.ph', role: 'admin', status: 'active', avatar: null, createdAt: '2024-01-15' },
      { id: 2, name: 'Dr. Maria Santos', email: 'faculty@csu.edu.ph', role: 'faculty', status: 'active', department: 'Computer Science', avatar: null, createdAt: '2024-02-01' },
      { id: 3, name: 'John Dela Cruz', email: 'student@csu.edu.ph', role: 'student', status: 'active', studentId: '2024-0001', avatar: null, createdAt: '2024-03-10' },
      { id: 4, name: 'Pedro Garcia', email: 'guard@csu.edu.ph', role: 'security', status: 'active', badgeNumber: 'SEC-001', avatar: null, createdAt: '2024-01-20' },
      { id: 5, name: 'Anna Reyes', email: 'anna.r@csu.edu.ph', role: 'student', status: 'active', studentId: '2024-0002', avatar: null, createdAt: '2024-03-12' },
      { id: 6, name: 'Prof. Jose Cruz', email: 'jose.c@csu.edu.ph', role: 'faculty', status: 'active', department: 'Engineering', avatar: null, createdAt: '2024-02-15' }
    ],
    
    vehicles: [
      { id: 1, plateNumber: 'ABC 1234', type: 'car', brand: 'Toyota', model: 'Vios', color: 'White', ownerId: 2, status: 'registered', registeredAt: '2024-02-01' },
      { id: 2, plateNumber: 'XYZ 5678', type: 'motorcycle', brand: 'Honda', model: 'Click 125i', color: 'Black', ownerId: 3, status: 'registered', registeredAt: '2024-03-10' },
      { id: 3, plateNumber: 'DEF 9012', type: 'car', brand: 'Honda', model: 'Civic', color: 'Silver', ownerId: 6, status: 'registered', registeredAt: '2024-02-20' },
      { id: 4, plateNumber: 'GHI 3456', type: 'van', brand: 'Toyota', model: 'Hiace', color: 'White', ownerId: null, status: 'unregistered', registeredAt: null },
      { id: 5, plateNumber: 'JKL 7890', type: 'car', brand: 'Mitsubishi', model: 'Mirage', color: 'Red', ownerId: 5, status: 'registered', registeredAt: '2024-03-15' }
    ],
    
    cameras: [
      { id: 1, name: 'Main Gate - Entry', location: 'Main Entrance', status: 'online', type: 'entry', lastActive: new Date().toISOString() },
      { id: 2, name: 'Main Gate - Exit', location: 'Main Entrance', status: 'online', type: 'exit', lastActive: new Date().toISOString() },
      { id: 3, name: 'Parking Lot A', location: 'Building A', status: 'online', type: 'parking', lastActive: new Date().toISOString() },
      { id: 4, name: 'Parking Lot B', location: 'Building B', status: 'offline', type: 'parking', lastActive: '2024-06-01T10:30:00' },
      { id: 5, name: 'Back Gate', location: 'Back Entrance', status: 'online', type: 'entry', lastActive: new Date().toISOString() },
      { id: 6, name: 'Faculty Parking', location: 'Admin Building', status: 'online', type: 'parking', lastActive: new Date().toISOString() }
    ],
    
    vehicleLogs: [
      { id: 1, vehicleId: 1, plateNumber: 'ABC 1234', cameraId: 1, type: 'entry', timestamp: '2024-06-15T08:15:00', status: 'authorized' },
      { id: 2, vehicleId: 2, plateNumber: 'XYZ 5678', cameraId: 1, type: 'entry', timestamp: '2024-06-15T08:30:00', status: 'authorized' },
      { id: 3, vehicleId: null, plateNumber: 'UNK 0000', cameraId: 1, type: 'entry', timestamp: '2024-06-15T09:00:00', status: 'unregistered' },
      { id: 4, vehicleId: 1, plateNumber: 'ABC 1234', cameraId: 2, type: 'exit', timestamp: '2024-06-15T12:00:00', status: 'authorized' },
      { id: 5, vehicleId: 3, plateNumber: 'DEF 9012', cameraId: 1, type: 'entry', timestamp: '2024-06-15T13:00:00', status: 'authorized' }
    ],
    
    securityShifts: [
      { id: 1, guardId: 4, startTime: '2024-06-15T06:00:00', endTime: null, status: 'active' }
    ],
    
    notifications: [
      { id: 1, type: 'alert', title: 'Unregistered Vehicle', message: 'Vehicle UNK 0000 detected at Main Gate', severity: 'high', createdAt: '2024-06-15T09:00:00', read: false },
      { id: 2, type: 'info', title: 'Camera Offline', message: 'Parking Lot B camera is offline', severity: 'medium', createdAt: '2024-06-15T10:30:00', read: false },
      { id: 3, type: 'success', title: 'Shift Started', message: 'Guard Pedro Garcia has started their shift', severity: 'low', createdAt: '2024-06-15T06:00:00', read: true }
    ]
  },

  /**
   * Simulate API response
   * @param {*} data - Response data
   * @param {boolean} success - Success status
   * @returns {Promise}
   */
  async respond(data, success = true) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    if (success) {
      return { success: true, data };
    }
    throw { success: false, error: data };
  },

  // ===== AUTH API =====
  
  async login(email, password) {
    const user = this.data.users.find(u => u.email === email);
    if (user && password.length >= 6) {
      const { id, name, email: userEmail, role, avatar } = user;
      return this.respond({ id, name, email: userEmail, role, avatar });
    }
    throw { success: false, error: 'Invalid credentials' };
  },

  async logout() {
    return this.respond({ message: 'Logged out successfully' });
  },

  // ===== USERS API =====
  
  async getUsers(filters = {}) {
    let users = [...this.data.users];
    
    if (filters.role) {
      users = users.filter(u => u.role === filters.role);
    }
    if (filters.status) {
      users = users.filter(u => u.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search)
      );
    }
    
    return this.respond(users);
  },

  async getUser(id) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) throw { success: false, error: 'User not found' };
    return this.respond(user);
  },

  async createUser(userData) {
    const newUser = {
      id: Math.max(...this.data.users.map(u => u.id)) + 1,
      ...userData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.data.users.push(newUser);
    return this.respond(newUser);
  },

  async updateUser(id, userData) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) throw { success: false, error: 'User not found' };
    
    this.data.users[index] = { ...this.data.users[index], ...userData };
    return this.respond(this.data.users[index]);
  },

  async deleteUser(id) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) throw { success: false, error: 'User not found' };
    
    this.data.users.splice(index, 1);
    return this.respond({ message: 'User deleted' });
  },

  // ===== VEHICLES API =====
  
  async getVehicles(filters = {}) {
    let vehicles = [...this.data.vehicles];
    
    if (filters.status) {
      vehicles = vehicles.filter(v => v.status === filters.status);
    }
    if (filters.type) {
      vehicles = vehicles.filter(v => v.type === filters.type);
    }
    if (filters.ownerId) {
      vehicles = vehicles.filter(v => v.ownerId === filters.ownerId);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      vehicles = vehicles.filter(v => 
        v.plateNumber.toLowerCase().includes(search) ||
        v.brand.toLowerCase().includes(search) ||
        v.model.toLowerCase().includes(search)
      );
    }
    
    // Include owner info
    vehicles = vehicles.map(v => ({
      ...v,
      owner: this.data.users.find(u => u.id === v.ownerId) || null
    }));
    
    return this.respond(vehicles);
  },

  async getVehicle(id) {
    const vehicle = this.data.vehicles.find(v => v.id === id);
    if (!vehicle) throw { success: false, error: 'Vehicle not found' };
    return this.respond({
      ...vehicle,
      owner: this.data.users.find(u => u.id === vehicle.ownerId) || null
    });
  },

  async checkPlate(plateNumber) {
    const vehicle = this.data.vehicles.find(v => 
      v.plateNumber.replace(/\s/g, '').toLowerCase() === plateNumber.replace(/\s/g, '').toLowerCase()
    );
    return this.respond({
      registered: !!vehicle && vehicle.status === 'registered',
      vehicle: vehicle || null,
      owner: vehicle ? this.data.users.find(u => u.id === vehicle.ownerId) : null
    });
  },

  async createVehicle(vehicleData) {
    const newVehicle = {
      id: Math.max(...this.data.vehicles.map(v => v.id)) + 1,
      ...vehicleData,
      registeredAt: new Date().toISOString().split('T')[0]
    };
    this.data.vehicles.push(newVehicle);
    return this.respond(newVehicle);
  },

  async updateVehicle(id, vehicleData) {
    const index = this.data.vehicles.findIndex(v => v.id === id);
    if (index === -1) throw { success: false, error: 'Vehicle not found' };
    
    this.data.vehicles[index] = { ...this.data.vehicles[index], ...vehicleData };
    return this.respond(this.data.vehicles[index]);
  },

  async deleteVehicle(id) {
    const index = this.data.vehicles.findIndex(v => v.id === id);
    if (index === -1) throw { success: false, error: 'Vehicle not found' };
    
    this.data.vehicles.splice(index, 1);
    return this.respond({ message: 'Vehicle deleted' });
  },

  // ===== CAMERAS API =====
  
  async getCameras(filters = {}) {
    let cameras = [...this.data.cameras];
    
    if (filters.status) {
      cameras = cameras.filter(c => c.status === filters.status);
    }
    if (filters.type) {
      cameras = cameras.filter(c => c.type === filters.type);
    }
    
    return this.respond(cameras);
  },

  async getCamera(id) {
    const camera = this.data.cameras.find(c => c.id === id);
    if (!camera) throw { success: false, error: 'Camera not found' };
    return this.respond(camera);
  },

  async createCamera(cameraData) {
    const newCamera = {
      id: Math.max(...this.data.cameras.map(c => c.id)) + 1,
      ...cameraData,
      lastActive: new Date().toISOString()
    };
    this.data.cameras.push(newCamera);
    return this.respond(newCamera);
  },

  async updateCamera(id, cameraData) {
    const index = this.data.cameras.findIndex(c => c.id === id);
    if (index === -1) throw { success: false, error: 'Camera not found' };
    
    this.data.cameras[index] = { ...this.data.cameras[index], ...cameraData };
    return this.respond(this.data.cameras[index]);
  },

  async deleteCamera(id) {
    const index = this.data.cameras.findIndex(c => c.id === id);
    if (index === -1) throw { success: false, error: 'Camera not found' };
    
    this.data.cameras.splice(index, 1);
    return this.respond({ message: 'Camera deleted' });
  },

  // ===== VEHICLE LOGS API =====
  
  async getVehicleLogs(filters = {}) {
    let logs = [...this.data.vehicleLogs];
    
    if (filters.status) {
      logs = logs.filter(l => l.status === filters.status);
    }
    if (filters.type) {
      logs = logs.filter(l => l.type === filters.type);
    }
    if (filters.cameraId) {
      logs = logs.filter(l => l.cameraId === filters.cameraId);
    }
    if (filters.date) {
      logs = logs.filter(l => l.timestamp.startsWith(filters.date));
    }
    
    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return this.respond(logs);
  },

  async logVehicleDetection(plateNumber, cameraId, type = 'entry') {
    const vehicle = this.data.vehicles.find(v => 
      v.plateNumber.replace(/\s/g, '') === plateNumber.replace(/\s/g, '')
    );
    
    const log = {
      id: Math.max(...this.data.vehicleLogs.map(l => l.id)) + 1,
      vehicleId: vehicle?.id || null,
      plateNumber,
      cameraId,
      type,
      timestamp: new Date().toISOString(),
      status: vehicle?.status === 'registered' ? 'authorized' : 'unregistered'
    };
    
    this.data.vehicleLogs.push(log);
    
    // Create notification for unregistered vehicles
    if (log.status === 'unregistered') {
      this.addNotification({
        type: 'alert',
        title: 'Unregistered Vehicle Detected',
        message: `Vehicle ${plateNumber} detected at Camera ${cameraId}`,
        severity: 'high'
      });
    }
    
    return this.respond(log);
  },

  // ===== SECURITY SHIFTS API =====
  
  async startShift(guardId) {
    const existingShift = this.data.securityShifts.find(s => 
      s.guardId === guardId && s.status === 'active'
    );
    
    if (existingShift) {
      throw { success: false, error: 'Shift already active' };
    }
    
    const shift = {
      id: Math.max(0, ...this.data.securityShifts.map(s => s.id)) + 1,
      guardId,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'active'
    };
    
    this.data.securityShifts.push(shift);
    return this.respond(shift);
  },

  async endShift(shiftId) {
    const shift = this.data.securityShifts.find(s => s.id === shiftId);
    if (!shift) throw { success: false, error: 'Shift not found' };
    
    shift.endTime = new Date().toISOString();
    shift.status = 'completed';
    
    return this.respond(shift);
  },

  async getCurrentShift(guardId) {
    const shift = this.data.securityShifts.find(s => 
      s.guardId === guardId && s.status === 'active'
    );
    return this.respond(shift || null);
  },

  // ===== NOTIFICATIONS API =====
  
  async getNotifications(filters = {}) {
    let notifications = [...this.data.notifications];
    
    if (filters.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    
    // Sort by date descending
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return this.respond(notifications);
  },

  addNotification(notification) {
    const newNotification = {
      id: Math.max(0, ...this.data.notifications.map(n => n.id)) + 1,
      ...notification,
      createdAt: new Date().toISOString(),
      read: false
    };
    this.data.notifications.unshift(newNotification);
    
    // Dispatch event for real-time updates
    document.dispatchEvent(new CustomEvent('notification:new', { detail: newNotification }));
    
    return newNotification;
  },

  async markNotificationRead(id) {
    const notification = this.data.notifications.find(n => n.id === id);
    if (!notification) throw { success: false, error: 'Notification not found' };
    
    notification.read = true;
    return this.respond(notification);
  },

  // ===== DASHBOARD STATS API =====
  
  async getDashboardStats(role) {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = this.data.vehicleLogs.filter(l => l.timestamp.startsWith(today));
    
    const stats = {
      totalUsers: this.data.users.length,
      totalVehicles: this.data.vehicles.length,
      registeredVehicles: this.data.vehicles.filter(v => v.status === 'registered').length,
      totalCameras: this.data.cameras.length,
      onlineCameras: this.data.cameras.filter(c => c.status === 'online').length,
      todayEntries: todayLogs.filter(l => l.type === 'entry').length,
      todayExits: todayLogs.filter(l => l.type === 'exit').length,
      unregisteredAlerts: todayLogs.filter(l => l.status === 'unregistered').length,
      unreadNotifications: this.data.notifications.filter(n => !n.read).length
    };
    
    // Role-specific stats
    if (role === 'student' || role === 'faculty') {
      const userId = role === 'student' ? 3 : 2; // Mock user IDs
      stats.myVehicles = this.data.vehicles.filter(v => v.ownerId === userId).length;
      stats.myLogs = this.data.vehicleLogs.filter(l => {
        const vehicle = this.data.vehicles.find(v => v.id === l.vehicleId);
        return vehicle?.ownerId === userId;
      }).length;
    }
    
    return this.respond(stats);
  }
};
