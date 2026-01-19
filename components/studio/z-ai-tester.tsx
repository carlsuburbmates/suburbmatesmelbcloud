'use client';

import { useChat } from '@ai-sdk/react';

export default function ZAiTester() {
  // @ts-ignore
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="p-4 border rounded-lg bg-gray-50 max-w-md mx-auto my-8">
      <h2 className="text-lg font-bold mb-4">Z.ai Automation Tester</h2>
      
      <div className="space-y-4 mb-4 h-64 overflow-y-auto bg-white p-3 rounded border">
        {(!messages || messages.length === 0) && (
          <p className="text-gray-400 text-sm text-center mt-10">
            System ready. Enter a prompt to test Z.ai connectivity.
          </p>
        )}
        {messages && messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-2 text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-900'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-gray-100 text-gray-500 rounded-lg p-2 text-xs animate-pulse">
               Thinking...
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded text-sm"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask Z.ai something..."
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
