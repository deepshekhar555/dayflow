import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Download } from 'lucide-react';

const Payroll = () => {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    axios.get('http://localhost:5000/api/payroll/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.success) {
        setPayslips(res.data.payslips);
      }
    }).catch(err => console.error(err));
  }, [navigate]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground">
            &larr; Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-foreground">My Payslips</h1>
        </header>

        <div className="grid gap-6">
          {payslips.length === 0 ? (
            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border text-center">
              <p className="text-muted-foreground">No payslips available yet.</p>
            </div>
          ) : (
            payslips.map((slip, idx) => (
              <div key={idx} className="bg-card p-6 rounded-2xl shadow-sm border border-border flex justify-between items-center hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{monthNames[slip.month - 1]} {slip.year}</h3>
                    <p className="text-sm text-muted-foreground">Generated on {new Date(slip.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="text-right mr-8">
                  <p className="text-sm text-muted-foreground">Net Salary</p>
                  <p className="text-xl font-bold text-green-600">${slip.netSalary.toLocaleString()}</p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Payroll;
