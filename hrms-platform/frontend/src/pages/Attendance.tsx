import React from 'react';

const Attendance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-2 text-sm text-gray-500">
            Track your attendance and view attendance reports.
          </p>
          <div className="mt-4 p-8 text-center text-gray-500">
            Attendance functionality will be implemented here.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;