import React, { useState } from 'react';
import { Star, Zap, ArrowLeft, Copy, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';
import { apiDocs } from './data/mock';

type ServiceId = 'home' | 'stars' | 'premium';

const Card = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-[#111] border border-gray-800 rounded-xl overflow-hidden", className)} {...props}>
    {children}
  </div>
);

const CodeBlock = ({ code, title }: { code: string, title?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="my-4">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#161b22]">
          <span className="text-xs font-medium text-gray-400">{title}</span>
          <button 
            onClick={handleCopy}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
      <div className="p-4 overflow-x-auto relative">
        {!title && (
          <button 
            onClick={handleCopy}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
        <pre className="text-sm font-mono text-gray-300">
          <code>{code}</code>
        </pre>
      </div>
    </Card>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState<ServiceId>('home');

  const renderHome = () => (
    <div className="max-w-3xl mx-auto pt-24 px-4 sm:px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">StarBridge API</h1>
        <p className="text-gray-400 text-lg">Developer documentation for Telegram services.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <button 
          onClick={() => setActiveView('stars')}
          className="text-left group"
        >
          <Card className="p-6 h-full hover:border-gray-600 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Telegram Stars</h2>
            <p className="text-sm text-gray-400">Automated service to send Telegram Stars to users via API.</p>
          </Card>
        </button>

        <button 
          onClick={() => setActiveView('premium')}
          className="text-left group"
        >
          <Card className="p-6 h-full hover:border-gray-600 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Telegram Premium</h2>
            <p className="text-sm text-gray-400">Automated service to activate Telegram Premium for users.</p>
          </Card>
        </button>
      </div>
    </div>
  );

  const renderDocs = () => {
    if (activeView === 'home') return null;
    const doc = apiDocs[activeView];

    return (
      <div className="max-w-4xl mx-auto pt-16 pb-24 px-4 sm:px-6">
        <button 
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">{doc.title}</h1>
          <p className="text-gray-400 text-lg">{doc.description}</p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Endpoint</h2>
            <div className="bg-[#111] border border-gray-800 rounded-lg px-4 py-3 font-mono text-sm flex items-center gap-3">
              <span className="text-blue-400 font-bold">POST</span>
              <span className="text-gray-300">{doc.endpoint.replace('POST ', '')}</span>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Request Body</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="pb-3 font-medium">Field</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Required</th>
                    <th className="pb-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {doc.requestBody.map((field, i) => (
                    <tr key={i}>
                      <td className="py-4 font-mono text-gray-300">{field.field}</td>
                      <td className="py-4 font-mono text-blue-400">{field.type}</td>
                      <td className="py-4">
                        {field.required ? (
                          <span className="text-red-400 text-xs font-medium px-2 py-1 bg-red-400/10 rounded">Yes</span>
                        ) : (
                          <span className="text-gray-500 text-xs font-medium px-2 py-1 bg-gray-800 rounded">No</span>
                        )}
                      </td>
                      <td className="py-4 text-gray-400">{field.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Example Request</h2>
            <CodeBlock code={doc.exampleRequest} title="cURL" />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Success Response</h2>
            <CodeBlock code={doc.successResponse} title="200 OK" />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Error Responses</h2>
            <div className="space-y-4">
              {doc.errorResponses.map((err, i) => (
                <div key={i} className="bg-[#111] border border-gray-800 rounded-lg p-4">
                  <div className="font-mono text-red-400 font-bold mb-1">{err.code}</div>
                  <div className="text-gray-400 text-sm">{err.message}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans selection:bg-blue-500/30">
      {activeView === 'home' ? renderHome() : renderDocs()}
    </div>
  );
}
