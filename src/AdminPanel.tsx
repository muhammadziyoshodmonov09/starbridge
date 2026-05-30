import React, { useState, useEffect } from 'react';
import { Activity, CreditCard, DollarSign, ListFilter, CheckCircle2, XCircle, X, KeyRound, Inbox, AlertCircle } from 'lucide-react';

export default function AdminPanel() {
  // Auth state
  const [adminKey, setAdminKey] = useState<string>(sessionStorage.getItem('adminKey') || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(!!sessionStorage.getItem('adminKey'));

  // Dashboard state
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<any>(null);

  // Filters setup
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLimit, setFilterLimit] = useState('25');

  // Fetch Stats exactly once on successful key injection
  useEffect(() => {
    if (!adminKey) return;
    
    const fetchStats = async () => {
      try {
        const statsRes = await fetch('/api/admin/stats', { headers: { 'x-admin-key': adminKey } });
        if (statsRes.ok) {
          const statsBody = await statsRes.json();
          setStats(statsBody.data);
          setIsAuthenticated(true);
          setAuthError('');
        } else if (statsRes.status === 401) {
          setIsAuthenticated(false);
          setAuthError('Invalid admin key');
          sessionStorage.removeItem('adminKey');
          setAdminKey('');
        }
      } catch (err) {
        console.error("Stats API error", err);
        setAuthError('Network error connecting to API');
      } finally {
        setIsCheckingAuth(false);
      }
    };
    fetchStats();
  }, [adminKey]);

  // Fetch Transactions on load or whenever filters change (only if auth is verified)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchTransactions = async () => {
      setLoading(true);
      setDashboardError('');
      try {
        const params = new URLSearchParams();
        if (filterService !== 'all') params.append('service', filterService);
        if (filterStatus !== 'all') params.append('status', filterStatus);
        if (filterLimit !== 'all') params.append('limit', filterLimit);

        const txRes = await fetch(`/api/admin/transactions?${params.toString()}`, { 
          headers: { 'x-admin-key': adminKey } 
        });

        if (txRes.ok) {
          const txBody = await txRes.json();
          setTransactions(txBody.data);
        } else if (txRes.status === 401) {
          setIsAuthenticated(false);
          setAuthError('Session expired. Invalid admin key.');
          sessionStorage.removeItem('adminKey');
          setAdminKey('');
        } else {
          setDashboardError('Failed to fetch data from the server.');
        }
      } catch (err) {
        setDashboardError('Network error connecting to the API.');
        console.error("Transactions API error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filterService, filterStatus, filterLimit, isAuthenticated, adminKey]);

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const key = data.get('adminKey') as string;
    if (key.trim()) {
      sessionStorage.setItem('adminKey', key.trim());
      setIsCheckingAuth(true);
      setAdminKey(key.trim());
      setAuthError('');
    }
  };

  const formatDate = (ds: string) => {
    return new Date(ds).toLocaleString();
  };

  // ----- Chart Derived Data -----
  const successCount = stats?.successful_transactions || 0;
  const failedCount = stats?.failed_transactions || 0;
  const totalCount = stats?.total_transactions || 0;
  const pendingCount = Math.max(0, totalCount - successCount - failedCount);
  
  const safeDiv = stats?.total_transactions ? stats.total_transactions : 1;
  const successPct = Math.round((successCount / safeDiv) * 100);
  const failedPct = Math.round((failedCount / safeDiv) * 100);
  const pendingPct = 100 - successPct - failedPct;

  const txByDay = React.useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // transactions are sorted desc in db. group counts by local date string
    const counts: Record<string, number> = {};
    transactions.forEach(tx => {
      const d = new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      counts[d] = (counts[d] || 0) + 1;
    });

    // convert to array and reverse so the oldest day is on the left
    const chartData = Object.entries(counts).map(([date, count]) => ({ date, count })).reverse();
    const maxCount = Math.max(...chartData.map(d => d.count), 1);
    
    return chartData.map(d => ({ ...d, heightPct: Math.round((d.count / maxCount) * 100) }));
  }, [transactions]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans flex items-center justify-center selection:bg-blue-500/30">
        <div className="bg-[#111] border border-gray-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
            <KeyRound className="w-6 h-6 text-blue-500" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-100">Admin Access</h2>
          <p className="text-gray-400 text-sm text-center mb-8">Authenticate with your secure key to access proxy metrics.</p>
          
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-2">
              <input 
                type="password" 
                name="adminKey"
                required
                autoFocus
                disabled={isCheckingAuth}
                placeholder="Enter admin key..."
                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
              />
            </div>
            
            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                {authError}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isCheckingAuth}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-3 transition-colors disabled:bg-blue-600/50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isCheckingAuth ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-8 mt-4">
        
        {/* Header */}
        <header className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-gray-100">Admin Dashboard</h1>
          <p className="text-gray-400">Overview and transaction management</p>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { title: 'Total Transactions', value: loading ? '...' : stats?.total_transactions || '0', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:border-blue-500/30' },
            { title: 'Successful', value: loading ? '...' : stats?.successful_transactions || '0', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', glow: 'hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:border-green-500/30' },
            { title: 'Failed', value: loading ? '...' : stats?.failed_transactions || '0', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', glow: 'hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:border-red-500/30' },
            { title: 'Total TON', value: loading ? '...' : stats?.total_ton_value || '0', icon: CreditCard, color: 'text-indigo-500', bg: 'bg-indigo-500/10', glow: 'hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:border-indigo-500/30' },
            { title: 'Total USD', value: loading ? '...' : `$${stats?.total_usd_value || '0'}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-emerald-500/30' },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-[#111] border border-gray-800 p-5 rounded-xl flex items-center justify-between transition-all duration-300 ${stat.glow}`}>
              <div className="space-y-1">
                <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                <div className="text-2xl font-semibold text-gray-200">{stat.value}</div>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        {isAuthenticated && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Chart 1: Success / Failed Breakdown */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-5 flex flex-col justify-center">
              <h3 className="text-gray-400 font-medium text-sm mb-5">Transaction Status Breakdown</h3>
              {totalCount === 0 ? (
                <div className="text-center text-sm text-gray-600 py-4">No data to display</div>
              ) : (
                <div className="w-full space-y-4">
                  {/* Segmentation Bar Engine */}
                  <div className="h-4 w-full bg-gray-800/50 rounded-full overflow-hidden flex shadow-inner">
                    <div style={{ width: `${successPct}%` }} className="bg-green-500 transition-all duration-1000 ease-in-out h-full border-r border-[#111]" />
                    <div style={{ width: `${failedPct}%` }} className="bg-red-500 transition-all duration-1000 ease-in-out h-full border-r border-[#111]" />
                    <div style={{ width: `${pendingPct}%` }} className="bg-yellow-500 transition-all duration-1000 ease-in-out h-full" />
                  </div>
                  {/* Legend Engine */}
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-green-500" />
                      <span className="text-gray-300">Success ({successPct}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-red-500" />
                      <span className="text-gray-300">Failed ({failedPct}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-yellow-500" />
                      <span className="text-gray-300">Pending ({pendingPct}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chart 2: Recent Activity Timeline */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-5 flex flex-col">
              <h3 className="text-gray-400 font-medium text-sm mb-4">Activity Timeline (Current View)</h3>
              <div className="flex-1 flex items-end justify-between gap-2 h-32 pt-2 pb-2">
                {txByDay.length === 0 ? (
                  <div className="w-full text-center text-sm text-gray-600 mb-6">No timelines generated yet</div>
                ) : (
                  txByDay.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 group">
                      {/* Bar Item */}
                      <div className="relative w-full flex justify-center h-full items-end pb-1">
                        {/* Tooltip Header */}
                        <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap shadow-lg">
                          {day.count} txns
                        </div>
                        {/* Progress Bar Dynamic Drop */}
                        <div 
                          style={{ height: `${day.heightPct}%` }} 
                          className="w-full max-w-[2rem] bg-blue-500/50 hover:bg-blue-400 rounded-t-sm transition-all duration-700 ease-out border-t border-blue-500 border-x"
                        />
                      </div>
                      {/* Date Caption */}
                      <div className="text-[10px] text-gray-500 mt-2 rotate-[-45deg] whitespace-nowrap lg:rotate-0">{day.date}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          
          {/* Filters Interactive Section */}
          <div className="border-b border-gray-800 p-5 flex flex-wrap items-center gap-4 bg-[#161b22]">
            <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
              <ListFilter className="w-4 h-4" /> Filters:
            </div>
            <select 
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="bg-[#0f1115] border border-gray-800 text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 hover:border-gray-700 transition-colors"
            >
              <option value="all">All Services</option>
              <option value="stars">Stars</option>
              <option value="premium">Premium</option>
            </select>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0f1115] border border-gray-800 text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 hover:border-gray-700 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
            <select 
              value={filterLimit}
              onChange={(e) => setFilterLimit(e.target.value)}
              className="bg-[#0f1115] border border-gray-800 text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 hover:border-gray-700 transition-colors"
            >
              <option value="10">10 Rows</option>
              <option value="25">25 Rows</option>
              <option value="50">50 Rows</option>
              <option value="100">100 Rows</option>
              <option value="all">All</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0f1115] border-b border-gray-800 uppercase text-xs text-gray-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">ID</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Service</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Username</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Amount / Duration</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">TON Cost</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">USD Value</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="hover:bg-[#161b22] transition-colors">
                      <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-800/70 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-800/70 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-800/70 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-10 bg-gray-800/70 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-800/70 rounded-full animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-800/70 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-800/70 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-800/70 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : dashboardError ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-red-500">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                          <AlertCircle className="w-8 h-8 opacity-80" />
                        </div>
                        <p className="text-base font-semibold">{dashboardError}</p>
                        <p className="text-sm mt-1 text-red-400/80">Please check your connection and try again.</p>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                          <Inbox className="w-8 h-8 opacity-60" />
                        </div>
                        <p className="text-base font-semibold text-gray-300">No transactions found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or wait for new orders to arrive.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-[#1a202c] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-gray-400 whitespace-nowrap">#{tx.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${tx.service === 'stars' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {tx.service}
                        </span>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[150px] whitespace-nowrap">{tx.username}</td>
                      <td className="px-6 py-4 font-mono whitespace-nowrap">{tx.amount || tx.duration || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tx.status === 'success' ? 'bg-green-500/10 text-green-500' : tx.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-400 whitespace-nowrap">
                        {tx.ton_cost ? `${tx.ton_cost} TON` : '-'}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-400 whitespace-nowrap">
                        {tx.usd_value ? `$${tx.usd_value}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">{formatDate(tx.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 shadow-2xl" onClick={() => setSelectedTx(null)}>
          <div className="bg-[#111] border border-gray-800 rounded-xl w-full max-w-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#161b22]">
              <h3 className="text-lg font-semibold text-white">Transaction Details <span className="text-gray-500 font-mono text-sm ml-2">#{selectedTx.id}</span></h3>
              <button className="text-gray-400 hover:text-white transition-colors" onClick={() => setSelectedTx(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[75vh] text-sm text-gray-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Service</div>
                  <div className={`inline-block px-2 py-1 rounded font-medium uppercase ${selectedTx.service === 'stars' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {selectedTx.service}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</div>
                  <div className={`inline-block px-2.5 py-1 rounded-full font-medium ${selectedTx.status === 'success' ? 'bg-green-500/10 text-green-500' : selectedTx.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {selectedTx.status}
                  </div>
                </div>

                <div className="border-t border-gray-800/50 sm:col-span-2 pt-4 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Username</div>
                      <div className="font-medium text-white">{selectedTx.username}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</div>
                      <div className="font-mono">{selectedTx.order_id || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount</div>
                      <div className="font-mono">{selectedTx.amount || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</div>
                      <div className="font-mono">{selectedTx.duration || '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800/50 sm:col-span-2 pt-4 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">TON Cost</div>
                      <div className="font-mono text-emerald-400">{selectedTx.ton_cost ? `${selectedTx.ton_cost} TON` : '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">TON Price USD</div>
                      <div className="font-mono text-gray-400">{selectedTx.ton_price_usd ? `$${selectedTx.ton_price_usd}` : '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total USD Value</div>
                      <div className="font-mono text-emerald-400">{selectedTx.usd_value ? `$${selectedTx.usd_value}` : '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800/50 sm:col-span-2 pt-4 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created At</div>
                      <div className="text-gray-400">{formatDate(selectedTx.created_at)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Completed At</div>
                      <div className="text-gray-400">{selectedTx.completed_at ? formatDate(selectedTx.completed_at) : '-'}</div>
                    </div>
                  </div>
                </div>

                {(selectedTx.provider_error_code || selectedTx.provider_message) && (
                  <div className="border-t border-gray-800/50 sm:col-span-2 pt-4 mt-2">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                      <div className="text-xs text-red-500 uppercase tracking-wider mb-2 font-bold">Provider Error Details</div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Error Code</div>
                          <div className="font-mono text-red-400 bg-[#0a0a0a] px-2 py-1 inline-block rounded">{selectedTx.provider_error_code || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Message</div>
                          <div className="text-red-300 text-sm whitespace-pre-wrap">{selectedTx.provider_message || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-800 bg-[#161b22] text-right">
              <button 
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
