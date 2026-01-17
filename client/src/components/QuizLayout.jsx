import React from 'react';

const QuizLayout = ({ children, isSidebarOpen, closeSidebar, handleTopicClick, language }) => (
    <div className="flex min-h-screen">
        <main className="flex-1 lg:ml-72 w-full max-w-[100vw] overflow-x-hidden">
            {children}
        </main>
    </div>
);

export default QuizLayout;
