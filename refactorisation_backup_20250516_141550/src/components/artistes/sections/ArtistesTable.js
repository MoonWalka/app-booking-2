// src/components/artistes/sections/ArtistesTable.js
import React from 'react';
import { Table, Card } from 'react-bootstrap';
import ArtisteRow from './ArtisteRow';
import styles from './ArtistesTable.module.css';

/**
 * Table component to display artists list
 * @param {Object} props - Component props 
 * @param {Array} props.artistes - List of artists to display
 * @param {Function} props.onDelete - Handler for artist deletion
 */
const ArtistesTable = ({ artistes, onDelete }) => {
  return (
    <Card className={styles.artistesListContainer}>
      <Table hover responsive className={styles.artistesTable + " mb-0"}>
        <thead>
          <tr>
            <th className="w-40">Artiste</th>
            <th className="w-15">Lieu</th>
            <th className="w-15">Cachet</th>
            <th className="w-15">Concerts</th>
            <th className="w-15">Actions</th>
          </tr>
        </thead>
        <tbody>
          {artistes.map(artiste => (
            <ArtisteRow 
              key={artiste.id} 
              artiste={artiste} 
              onDelete={onDelete} 
            />
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default ArtistesTable;