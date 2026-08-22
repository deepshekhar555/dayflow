import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Activity, Settings, Sparkles, Search, User, Building, Briefcase } from 'lucide-react';

const Employees = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [interpretation, setInterpretation] = useState('');

  // Initial load
  useEffect(() => {
    handleSearch('');
  }, []);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/ai/search', { query }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEmployees(res.data.results);
        setInterpretation(res.data.interpretation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col hidden md:flex">
        <div className="font-bold text-2xl text-primary mb-12">Dayflow HR</div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => navigate('/hr/dashboard')} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Activity className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg bg-primary/10 text-primary">
            <Users className="w-5 h-5 mr-3" /> Employees
          </button>
          <button onClick={() => navigate('/hr/system')} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 mr-3" /> System
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Employee Directory</h1>
          <p className="text-muted-foreground mt-1">Search and manage your workforce.</p>
        </header>

        {/* NL Search Bar */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-2xl border border-primary/20 mb-8">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-semibold">Natural Language Search</h2>
          </div>
          <form onSubmit={onSubmit} className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Try asking: 'Show me engineering managers' or 'Who was hired recently?'"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 text-sm disabled:opacity-50 transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>
          {interpretation && searchQuery.trim() !== '' && (
            <p className="mt-3 text-sm text-muted-foreground ml-2">
              <span className="font-medium text-foreground">AI Interpreted:</span> {interpretation}
            </p>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-card rounded-2xl border border-border">
              <p className="text-muted-foreground">No employees found matching your query.</p>
            </div>
          ) : (
            employees.map(emp => (
              <div key={emp.id} className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{emp.firstName} {emp.lastName}</h3>
                    <p className="text-xs text-muted-foreground">{emp.user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{emp.designation || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4" />
                    <span>{emp.department || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
};

export default Employees;
