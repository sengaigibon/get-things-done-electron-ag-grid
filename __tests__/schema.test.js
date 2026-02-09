/**
 * Unit tests for schema.js database functions
 */

const schema = require('../js/schema');

describe('Schema Database Operations', () => {
  
  describe('Database Status Constants', () => {
    test('should have correct status values', () => {
      expect(schema.statusIdle).toBe('idle');
      expect(schema.statusActive).toBe('active');
      expect(schema.statusCompleted).toBe('completed');
    });
  });

  describe('Database Schema Constants', () => {
    test('should exist', () => {
      expect(schema.statusIdle).toBe('idle');
      expect(schema.statusActive).toBe('active');
      expect(schema.statusCompleted).toBe('completed');
    });
  });

  describe('Database operations functions', () => {
    test('should exist', () => {
      expect(typeof schema.getSQL).toBe('function');
      expect(typeof schema.getDB).toBe('function');
      expect(typeof schema.initDb).toBe('function');
      expect(typeof schema.insertNew).toBe('function');
      expect(typeof schema.updateStatus).toBe('function');
      expect(typeof schema.startTracking).toBe('function');
      expect(typeof schema.stopTracking).toBe('function');
      expect(typeof schema.getTasksByDate).toBe('function');
      expect(typeof schema.getTracksByTask).toBe('function');
      expect(typeof schema.updateTrackData).toBe('function');

      
    });
  });

});
