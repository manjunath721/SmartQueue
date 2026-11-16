import React from 'react';

const StatusBadge = ({ status }) => {
  const getIcon = () => {
    switch (status) {
      case 'WAITING':
        return 'bi-hourglass-split';
      case 'SERVING':
        return 'bi-bell-fill';
      case 'COMPLETED':
        return 'bi-check-circle-fill';
      case 'CANCELLED':
        return 'bi-x-circle-fill';
      default:
        return 'bi-circle';
    }
  };

  return (
    <span className={`badge-status badge-${status || 'WAITING'}`}>
      <i className={`bi ${getIcon()}`}></i>
      {status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
