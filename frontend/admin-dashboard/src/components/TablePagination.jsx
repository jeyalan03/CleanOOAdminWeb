import React from "react";

export default function TablePagination({
    count,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange
}) {
    const start = page * rowsPerPage + 1;
    const end = Math.min(count, (page + 1) * rowsPerPage);
    const totalPages = Math.ceil(count / rowsPerPage);

    const handleFirst = () => onPageChange(0);
    const handlePrev = () => onPageChange(Math.max(0, page - 1));
    const handleNext = () => onPageChange(Math.min(totalPages - 1, page + 1));
    const handleLast = () => onPageChange(totalPages - 1);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 text-sm font-medium text-gray-400">

            {/* Rows Per Page */}
            <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                    value={rowsPerPage}
                    onChange={(e) => {
                        onRowsPerPageChange(parseInt(e.target.value));
                        onPageChange(0); // Reset to first page
                    }}
                    className="select select-sm select-bordered bg-black/20 border-white/10 text-white focus:border-primary/50 rounded-lg"
                >
                    <option value={5} className="bg-gray-900 text-white">5</option>
                    <option value={10} className="bg-gray-900 text-white">10</option>
                    <option value={20} className="bg-gray-900 text-white">20</option>
                    <option value={50} className="bg-gray-900 text-white">50</option>
                </select>
            </div>

            {/* Pagination Info */}
            <div className="text-white">
                {count > 0 ? `${start}–${end} of ${count}` : '0–0 of 0'}
            </div>

            {/* Navigation Buttons */}
            <div className="join bg-black/20 rounded-lg">
                <button
                    className="join-item btn btn-sm btn-ghost hover:bg-white/10 disabled:bg-transparent disabled:text-gray-700"
                    onClick={handleFirst}
                    disabled={page === 0}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                </button>
                <button
                    className="join-item btn btn-sm btn-ghost hover:bg-white/10 disabled:bg-transparent disabled:text-gray-700"
                    onClick={handlePrev}
                    disabled={page === 0}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                    className="join-item btn btn-sm btn-ghost hover:bg-white/10 disabled:bg-transparent disabled:text-gray-700"
                    onClick={handleNext}
                    disabled={page >= totalPages - 1}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
                <button
                    className="join-item btn btn-sm btn-ghost hover:bg-white/10 disabled:bg-transparent disabled:text-gray-700"
                    onClick={handleLast}
                    disabled={page >= totalPages - 1}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
}
