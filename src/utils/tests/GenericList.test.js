import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GenericList from '../../components/molecules/GenericList';

// Mock data
const mockItems = [
  { id: '1', name: 'Item 1', category: 'A' },
  { id: '2', name: 'Item 2', category: 'B' },
  { id: '3', name: 'Item 3', category: 'A' },
];

const mockSearchFields = [
  { accessor: (item) => item.name, label: 'Name' },
  { accessor: (item) => item.category, label: 'Category' },
];

const mockFilterOptions = [
  { value: 'categoryA', label: 'Category A', filterFn: (item) => item.category === 'A' },
  { value: 'categoryB', label: 'Category B', filterFn: (item) => item.category === 'B' },
];

const renderItem = (item) => (
  <tr key={item.id}>
    <td>{item.name}</td>
    <td>{item.category}</td>
  </tr>
);

describe('GenericList Component', () => {
  test('renders title correctly', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test List')).toBeInTheDocument();
  });

  test('renders add button with correct link', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
          addButtonText="Add Item"
          addButtonLink="/add"
        />
      </BrowserRouter>
    );
    
    const addButton = screen.getByText('Add Item');
    expect(addButton).toBeInTheDocument();
    expect(addButton.closest('a')).toHaveAttribute('href', '/add');
  });

  test('renders search bar when searchFields are provided', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
          searchFields={mockSearchFields}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
  });

  test('renders filter tabs when filterOptions are provided', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
          filterOptions={mockFilterOptions}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Tous')).toBeInTheDocument();
    expect(screen.getByText('Category A')).toBeInTheDocument();
    expect(screen.getByText('Category B')).toBeInTheDocument();
  });

  test('renders loading spinner when loading is true', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
          loading={true}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  test('renders empty message when no items are available', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={[]}
          renderItem={renderItem}
          emptyMessage="No items found"
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  test('renders items correctly', () => {
    render(
      <BrowserRouter>
        <GenericList
          title="Test List"
          items={mockItems}
          renderItem={renderItem}
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });
});
