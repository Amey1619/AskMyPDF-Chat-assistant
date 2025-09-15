const AlertModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Alert</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-800 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AlertModal;