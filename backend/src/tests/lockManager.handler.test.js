const LockManager = require('../services/lockManager.service');
const Lock = require('../models/lock.model');

jest.mock('../models/lock.model');

describe('Lock Manager Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('acquireLock', () => {
    it('should acquire lock successfully when it does not exist', async () => {
      // Mock findOneAndUpdate returning null (no active/expired lock found)
      Lock.findOneAndUpdate.mockResolvedValue(null);
      // Mock create succeeding
      Lock.create.mockResolvedValue({
        lockKey: 'lock:test:123',
        ownerId: 'worker-1',
        expiresAt: new Date(Date.now() + 10000),
      });

      const result = await LockManager.acquireLock('lock:test:123', 10000, 'worker-1');
      expect(result).toBe(true);
      expect(Lock.findOneAndUpdate).toHaveBeenCalled();
      expect(Lock.create).toHaveBeenCalled();
    });

    it('should reclaim lock if lock is expired', async () => {
      // Mock findOneAndUpdate returning updated lock (meaning expired lock was overtaken)
      Lock.findOneAndUpdate.mockResolvedValue({
        lockKey: 'lock:test:123',
        ownerId: 'worker-1',
        expiresAt: new Date(Date.now() + 10000),
      });

      const result = await LockManager.acquireLock('lock:test:123', 10000, 'worker-1');
      expect(result).toBe(true);
      expect(Lock.findOneAndUpdate).toHaveBeenCalled();
      expect(Lock.create).not.toHaveBeenCalled();
    });

    it('should fail to acquire lock if already held by another worker', async () => {
      // Mock findOneAndUpdate returning null (no expired lock available)
      Lock.findOneAndUpdate.mockResolvedValue(null);
      // Mock create throwing Duplicate Key Error (code 11000)
      const duplicateError = new Error('Duplicate key');
      duplicateError.code = 11000;
      Lock.create.mockRejectedValue(duplicateError);

      const result = await LockManager.acquireLock('lock:test:123', 10000, 'worker-1');
      expect(result).toBe(false);
      expect(Lock.findOneAndUpdate).toHaveBeenCalled();
      expect(Lock.create).toHaveBeenCalled();
    });
  });

  describe('releaseLock', () => {
    it('should release lock successfully if owned by releaser', async () => {
      Lock.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await LockManager.releaseLock('lock:test:123', 'worker-1');
      expect(result).toBe(true);
      expect(Lock.deleteOne).toHaveBeenCalledWith({
        lockKey: 'lock:test:123',
        ownerId: 'worker-1',
      });
    });

    it('should return false if lock was not deleted', async () => {
      Lock.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await LockManager.releaseLock('lock:test:123', 'worker-1');
      expect(result).toBe(false);
    });
  });
});
