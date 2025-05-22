import React from 'react';
import styles from './Table.module.css';

/**
 * Composant Table réutilisable
 * @param {Array} columns - [{ label, key, sortable, onSort }]
 * @param {Array} data - Données à afficher (array d'objets)
 * @param {Function} renderActions - Fonction pour afficher les actions par ligne (optionnel)
 * @param {String} sortField - Champ actuellement trié
 * @param {String} sortDirection - 'asc' ou 'desc'
 * @param {Function} onRowClick - Callback au clic sur une ligne (optionnel)
 */
const Table = ({ columns, data, renderActions, sortField, sortDirection, onSort, onRowClick }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((col, idx) => {
            // Si renderActions existe, ne pas mettre l'arrondi sur la dernière colonne de données
            const isLastDataCol = idx === columns.length - 1 && renderActions;
            const style = idx === 0
              ? { borderTopLeftRadius: 'var(--tc-border-radius-lg)' }
              : isLastDataCol
                ? {} // pas d'arrondi si actions
                : idx === columns.length - 1 && !renderActions
                  ? { borderTopRightRadius: 'var(--tc-border-radius-lg)' }
                  : {};
            return (
              <th
                key={col.key}
                className={col.sortable ? styles.sortableHeader : ''}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                style={style}
              >
                <div className={styles.headerContent}>
                  {col.label}
                  {col.sortable && sortField === col.key && (
                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </div>
              </th>
            );
          })}
          {renderActions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row, idx) => (
            <tr key={row.id || idx} className={styles.clickableRow} onClick={onRowClick ? () => onRowClick(row.id) : undefined}>
              {columns.map(col => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
              {renderActions && <td>{renderActions(row)}</td>}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-4">
              <div className="mb-3">
                <i className="bi bi-search fs-1 text-muted"></i>
              </div>
              <p className="mb-1 text-muted">Aucune donnée trouvée</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table; 