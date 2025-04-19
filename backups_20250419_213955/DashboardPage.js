import React from 'react';

const DashboardPage = () => {
  return (
    <div className="container mt-4">
      <h1>Dashboard</h1>
      <div className="row mt-4">
        <div className="col-md-3 mb-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Concerts</h5>
              <p className="card-text display-4">0</p>
              <p className="card-text">Concerts à venir</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Programmateurs</h5>
              <p className="card-text display-4">1</p>
              <p className="card-text">Programmateurs actifs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Lieux</h5>
              <p className="card-text display-4">1</p>
              <p className="card-text">Lieux disponibles</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Contrats</h5>
              <p className="card-text display-4">0</p>
              <p className="card-text">Contrats en cours</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              Concerts à venir
            </div>
            <div className="card-body">
              <p className="text-center">Aucun concert à venir</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              Activité récente
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Création du lieu "La Cigale"</li>
                <li className="list-group-item">Création du programmateur "Jean Dupont"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
