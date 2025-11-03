import { useState } from 'react';
import UploadSection from './components/UploadSection';
import PDFViewer from './components/PDFViewer';
import ChatInterface from './components/ChatInterface';
import { Upload } from 'lucide-react';
import './App.css';

function App() {
  const [documentId, setDocumentId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleUploadSuccess = (docId, file) => {
    setDocumentId(docId);
    setUploadedFile(file);
    setPdfUrl(`http://localhost:3000/api/pdf/${docId}`);
    setCurrentPage(1);
  };

  const handleCitationClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleReset = () => {
    setDocumentId(null);
    setUploadedFile(null);
    setPdfUrl(null);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📚 NotebookLM Clone
            </h1>
            <p className="text-gray-600 mt-1">
              Upload PDFs and chat with your documents using AI
            </p>
          </div>
          
          {documentId && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Upload className="h-4 w-4" />
              Upload New PDF
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!documentId ? (
          <UploadSection onUploadSuccess={handleUploadSuccess} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            <div className="h-full">
              <PDFViewer
                file={pdfUrl}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>

            <div className="h-full">
              <ChatInterface
                documentId={documentId}
                onCitationClick={handleCitationClick}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;