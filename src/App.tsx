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

const FloatingTelegramButton = () => (
  <>
    <style>{`
      @keyframes soft-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      .animate-soft-float {
        animation: soft-float 3s ease-in-out infinite;
      }
    `}</style>
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 group animate-soft-float">
      {/* Desktop Tooltip */}
      <div className="hidden sm:block opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
        <div className="bg-[#1C1C1E] border border-gray-800 text-sm text-gray-400 px-4 py-2 rounded-2xl shadow-xl whitespace-nowrap">
          Created by <span className="text-white font-medium">@Muhammadziyo_dev</span>
        </div>
      </div>
      
      {/* Main Circular Button */}
      <a
        href="https://t.me/Muhammadziyo_dev"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-[60px] h-[60px] bg-[#24A1DE] text-white rounded-full 
                   shadow-[0_8px_20px_rgba(36,161,222,0.3)] hover:shadow-[0_10px_25px_rgba(36,161,222,0.5)] 
                   transition-all duration-300 hover:scale-[1.08] active:scale-95 cursor-pointer"
        aria-label="Contact Developer on Telegram"
      >
        {/* Unread Red Notification Badge */}
        <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px]">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-60 duration-1000"></span>
          <span className="relative inline-flex rounded-full h-[18px] w-[18px] bg-[#FF3B30] border-2 border-[#111]"></span>
        </span>

        {/* Improved Telegram Paper Plane Logo */}
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="ml-[-2px] mt-[1px]"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM12.43 8.85893C11.2628 9.3444 8.93014 10.3492 5.43181 11.8733C4.86383 12.0992 4.56626 12.3202 4.53911 12.5363C4.49273 12.9056 4.95408 13.0489 5.57864 13.2452C5.66442 13.2721 5.75385 13.3001 5.8456 13.3315C6.44473 13.5358 7.23438 13.7842 7.6433 13.7925C8.01428 13.7999 8.4287 13.6471 8.88632 13.3338C12.0121 11.2227 13.6481 10.1472 13.7944 10.1073C13.8988 10.0788 14.0416 10.043 14.1378 10.129C14.234 10.215 14.2245 10.3752 14.2144 10.418L14.2132 10.4229C14.1537 10.669 11.6669 12.9841 10.3667 14.1952C9.96195 14.5721 9.6804 14.8344 9.62024 14.8967C9.35626 15.1702 9.0792 15.4215 9.34969 15.7029C9.60533 15.9689 10.4116 16.5029 11.458 17.1958C11.6441 17.3191 11.8413 17.4497 12.0366 17.5794C12.9157 18.1632 13.6599 18.6575 14.3168 18.5997C14.6973 18.5661 15.0691 18.2127 15.2631 17.1683C15.7237 14.6865 16.6346 9.3242 16.8523 7.15181C16.8711 6.96347 16.883 6.75704 16.8906 6.55986C16.8986 6.35338 16.9038 6.13609 16.8222 5.95543C16.7441 5.78255 16.5925 5.6703 16.4253 5.62675C16.0368 5.52554 15.3403 5.72898 12.43 8.85893Z" 
            fill="currentColor"
          />
        </svg>
      </a>
    </div>
  </>
);

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
      <FloatingTelegramButton />
    </div>
  );
}
