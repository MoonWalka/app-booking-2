import { createService } from '../../services/firebaseService';

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

// Mock db
jest.mock('../../firebase', () => ({
  db: {}
}));

describe('Firebase Service', () => {
  let service;
  
  beforeEach(() => {
    service = createService('testCollection');
  });
  
  test('getAll returns items and lastVisible', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ name: 'Item 1' }) },
      { id: '2', data: () => ({ name: 'Item 2' }) }
    ];
    
    require('firebase/firestore').getDocs.mockResolvedValue({
      docs: mockDocs
    });
    
    const result = await service.getAll();
    
    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe('1');
    expect(result.items[0].name).toBe('Item 1');
    expect(result.lastVisible).toBe(mockDocs[1]);
  });
  
  test('getById returns item when it exists', async () => {
    require('firebase/firestore').getDoc.mockResolvedValue({
      exists: () => true,
      id: '1',
      data: () => ({ name: 'Item 1' })
    });
    
    const result = await service.getById('1');
    
    expect(result.id).toBe('1');
    expect(result.name).toBe('Item 1');
  });
  
  test('getById returns null when item does not exist', async () => {
    require('firebase/firestore').getDoc.mockResolvedValue({
      exists: () => false
    });
    
    const result = await service.getById('1');
    
    expect(result).toBeNull();
  });
  
  test('create adds document and returns item with id', async () => {
    require('firebase/firestore').addDoc.mockResolvedValue({
      id: '1'
    });
    
    const data = { name: 'New Item' };
    const result = await service.create(data);
    
    expect(result.id).toBe('1');
    expect(result.name).toBe('New Item');
  });
  
  test('update updates document and returns updated item', async () => {
    const data = { name: 'Updated Item' };
    const result = await service.update('1', data);
    
    expect(result.id).toBe('1');
    expect(result.name).toBe('Updated Item');
  });
  
  test('delete returns true on success', async () => {
    const result = await service.delete('1');
    
    expect(result).toBe(true);
  });
  
  test('search returns matching items', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ name: 'Item 1', category: 'A' }) },
      { id: '2', data: () => ({ name: 'Item 2', category: 'A' }) }
    ];
    
    require('firebase/firestore').getDocs.mockResolvedValue({
      docs: mockDocs
    });
    
    const result = await service.search('category', 'A');
    
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[0].category).toBe('A');
  });
});
