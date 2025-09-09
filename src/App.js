import React, { useState, useCallback } from 'react';

// Main App Component
const App = () => {
    // State management for code input and console output
    const [code, setCode] = useState('// Your JavaScript code goes here...\nconsole.log("Hello, World!");');
    const [output, setOutput] = useState([]);

    // --- Icon Components (inline SVG for simplicity) ---
    const PlayIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    );

    const ClearIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    );

    // --- Core Logic ---

    // Function to execute the user's code
    const runCode = useCallback(() => {
        const newOutput = [];
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
        };

        // Helper to add messages to our custom console
        const addToOutput = (message, type) => {
            const formattedMessage = Array.isArray(message) ?
                message.map(m => (typeof m === 'object' ? JSON.stringify(m, null, 2) : m)).join(' ') :
                (typeof message === 'object' ? JSON.stringify(message, null, 2) : message);

            newOutput.push({
                message: formattedMessage,
                type: type,
                timestamp: new Date().toLocaleTimeString()
            });
        };

        // Override console methods to capture logs
        console.log = (...args) => addToOutput(args, 'log');
        console.error = (...args) => addToOutput(args, 'error');
        console.warn = (...args) => addToOutput(args, 'warn');
        console.info = (...args) => addToOutput(args, 'info');

        try {
            // Use the Function constructor for safer execution than eval()
            new Function(code)();
        } catch (error) {
            console.error(error.toString());
        } finally {
            // Restore original console methods and update state
            console.log = originalConsole.log;
            console.error = originalConsole.error;
            console.warn = originalConsole.warn;
            console.info = originalConsole.info;
            setOutput(prev => [...prev, ...newOutput]);
        }
    }, [code]);

    // Function to clear the editor and console
    const clearAll = () => {
        setCode('');
        setOutput([]);
    };
    
    // Function to determine text color based on log type
    const getLogColor = (type) => {
        switch (type) {
            case 'error':
                return 'text-red-400';
            case 'warn':
                return 'text-yellow-400';
            case 'info':
                 return 'text-blue-400';
            case 'log':
            default:
                return 'text-gray-300';
        }
    };


    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
            {/* Header */}
            <header className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700 shadow-md">
                <div className="flex items-center space-x-3">
                     <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                    <h1 className="text-xl font-semibold text-gray-200">JavaScript Compiler UI</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={runCode}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        <PlayIcon />
                        <span>Run</span>
                    </button>
                    <button
                        onClick={clearAll}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        <ClearIcon />
                        <span>Clear</span>
                    </button>
                </div>
            </header>

            {/* Main Content: Editor and Console */}
            <main className="flex flex-1 flex-col lg:flex-row overflow-hidden">
                {/* Code Editor */}
                <div className="flex-1 flex flex-col p-2 lg:border-r border-gray-700">
                     <h2 className="text-sm font-mono p-2 text-gray-400">Editor</h2>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 w-full p-4 bg-gray-800 text-white font-mono text-base rounded-lg resize-none border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter your JavaScript code here..."
                        spellCheck="false"
                    />
                </div>

                {/* Console Output */}
                <div className="flex-1 flex flex-col p-2 h-1/2 lg:h-auto">
                    <h2 className="text-sm font-mono p-2 text-gray-400">Console</h2>
                    <div className="flex-1 w-full p-4 bg-gray-800 text-white font-mono text-sm rounded-lg border border-gray-700 overflow-y-auto">
                        {output.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Output will appear here...
                            </div>
                        ) : (
                            output.map((line, index) => (
                                <div key={index} className={`flex items-start ${getLogColor(line.type)} border-b border-gray-700/50 py-1`}>
                                    <span className="w-20 text-gray-500 text-xs">{line.timestamp}</span>
                                    <span className="flex-1 whitespace-pre-wrap pl-2">&gt; {line.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;