import React from 'react';

function Dashboard() {
  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Vue d'ensemble de votre activité</p>
      </div>
      <div className="page-content">
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Concerts</h3>
            <div className="count">12</div>
            <p>Concerts programmés</p>
          </div>
          <div className="dashboard-card">
            <h3>Contacts</h3>
            <div className="count">8</div>
            <p>Contacts actifs</p>
          </div>
          <div className="dashboard-card">
            <h3>À venir</h3>
            <div className="count">3</div>
            <p>Concerts cette semaine</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;