
export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDangerous = false }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in transition-all">
            <div className="modal-box bg-gray-900/90 border border-white/10 shadow-3xl rounded-[2rem] p-10 max-w-sm w-full relative transform hover:scale-[1.01] transition-transform duration-300">

                {/* Glowing Icon Background */}
                <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-full ${isDangerous ? 'bg-red-500/10 text-red-500' : 'bg-cyan-500/10 text-cyan-400'} ring-1 ring-white/5 shadow-xl`}>
                        {isDangerous ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="text-center">
                    <h3 className="font-bold text-2xl text-white mb-2 tracking-tight">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-8 font-light">{message}</p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onClose}
                        className="btn bg-white/5 border-0 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl h-12 normal-case font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`btn h-12 border-0 rounded-xl normal-case font-bold text-white shadow-lg transition-all transform active:scale-95 ${isDangerous
                            ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 shadow-red-500/20'
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-blue-500/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
