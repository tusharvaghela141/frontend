import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot } from 'lucide-react';

const ChatInterface = ({ documentId, onCitationClick }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m ready to answer questions about your PDF. What would you like to know?',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    if (!documentId) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: No document loaded. Please upload a PDF first.',
        error: true
      }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    
    const textarea = document.querySelector('textarea[placeholder="Ask a question about the PDF..."]');
    if (textarea) {
      textarea.style.height = '42px';
    }

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage
    }]);

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          documentId: documentId
        }),
      });

      let errorMessage = 'Sorry, I encountered an error. Please try again.';

      if (!response.ok) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (parseError) {
          errorMessage = `Error ${response.status}: ${response.statusText || 'Unknown error'}`;
        }
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: errorMessage,
          error: true
        }]);
        return;
      }

      const data = await response.json();

      if (data.answer) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer,
          citations: data.citations || []
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Received an unexpected response format.',
          error: true
        }]);
      }
    } catch (error) {
      const errorMsg = error.message.includes('fetch')
        ? 'Cannot connect to backend. Make sure the backend server is running on http://localhost:3000'
        : `Error: ${error.message}`;
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMsg,
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg">
        <h3 className="font-semibold">Chat with your PDF</h3>
        <p className="text-xs text-blue-100 mt-1">Ask questions about the document</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.error
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {message.citations && message.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.citations.map((citation, idx) => (
                    <button
                      key={idx}
                      onClick={() => onCitationClick(citation.page)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition"
                    >
                      Page {citation.page}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the PDF..."
            disabled={loading}
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none overflow-y-auto"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;