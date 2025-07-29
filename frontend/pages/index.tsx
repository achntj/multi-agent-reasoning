import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import axios from "axios";

type DebateResponse = {
  optimist: string;
  pessimist: string;
  synthesis: string;
  context: string;
};

type ActiveTab = "optimist" | "pessimist" | "synthesis";
type KnowledgeFile = {
  filename: string;
  content: string;
};

export default function DebateApp() {
  const [question, setQuestion] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [debate, setDebate] = useState<DebateResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("synthesis");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Fetch knowledge files from backend
  const fetchKnowledgeFiles = async () => {
    try {
      const response = await axios.get<KnowledgeFile[]>(
        "http://localhost:8000/knowledge",
      );
      setKnowledgeFiles(response.data);
    } catch (error) {
      console.error("Error fetching knowledge files:", error);
    }
  };

  // Load knowledge files on component mount
  useEffect(() => {
    fetchKnowledgeFiles();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post<DebateResponse>(
        "http://localhost:8000/debate",
        { question },
        { headers: { "Content-Type": "application/json" } },
      );
      setDebate(response.data);
    } catch (error) {
      console.error("Debate error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMessage(`${file.name} uploaded successfully!`);
      setTimeout(() => setUploadMessage(""), 3000);
      fetchKnowledgeFiles(); // Refresh the knowledge base after upload
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage("Upload failed");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden`}
      >
        <div className="p-4 h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            Knowledge Base
          </h2>

          <div className="flex-1 overflow-y-auto">
            {knowledgeFiles.length > 0 ? (
              <div className="space-y-2">
                {knowledgeFiles.map((file, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <details className="group">
                      <summary className="flex justify-between items-center font-medium cursor-pointer">
                        <span className="truncate">{file.filename}</span>
                        <svg
                          className="w-4 h-4 ml-1 transition-transform group-open:rotate-90"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </summary>
                      <pre className="mt-2 p-2 bg-white text-xs text-gray-600 overflow-x-auto rounded">
                        {typeof file.content === "string"
                          ? file.content
                          : JSON.stringify(file.content, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                <p>No files in knowledge base</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 mr-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            🌳 Agent Forest
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Upload Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Upload Knowledge
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex-1">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={!file}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Upload
                  </button>
                </div>
                {uploadMessage && (
                  <p
                    className={`text-sm ${uploadMessage.includes("failed") ? "text-red-500" : "text-green-500"}`}
                  >
                    {uploadMessage}
                  </p>
                )}
              </form>
            </div>

            {/* Debate Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                Start Debate
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your strategic question..."
                    className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!question.trim() || isLoading}
                    className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Debating...
                      </>
                    ) : (
                      "Start Debate"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Results */}
            {debate && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab("optimist")}
                      className={`py-3 px-4 text-center border-b-2 font-medium text-sm ${activeTab === "optimist" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                      Optimist
                    </button>
                    <button
                      onClick={() => setActiveTab("pessimist")}
                      className={`py-3 px-4 text-center border-b-2 font-medium text-sm ${activeTab === "pessimist" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                      Pessimist
                    </button>
                    <button
                      onClick={() => setActiveTab("synthesis")}
                      className={`py-3 px-4 text-center border-b-2 font-medium text-sm ${activeTab === "synthesis" ? "border-purple-500 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                    >
                      Synthesis
                    </button>
                  </nav>
                </div>
                <div className="p-6">
                  {activeTab === "optimist" && (
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-medium text-blue-700 mb-3">
                        Optimist Perspective
                      </h3>
                      <div className="text-gray-700 whitespace-pre-line">
                        {debate.optimist}
                      </div>
                    </div>
                  )}
                  {activeTab === "pessimist" && (
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-medium text-red-700 mb-3">
                        Pessimist Perspective
                      </h3>
                      <div className="text-gray-700 whitespace-pre-line">
                        {debate.pessimist}
                      </div>
                    </div>
                  )}
                  {activeTab === "synthesis" && (
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-medium text-purple-700 mb-3">
                        Final Recommendation
                      </h3>
                      <div className="text-gray-700 whitespace-pre-line">
                        {debate.synthesis}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
