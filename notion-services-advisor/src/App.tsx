import { useState } from 'react';
import { Settings, Target } from 'lucide-react';
import IntentForm from './components/IntentForm';
import OnePagerView from './components/OnePagerView';
import type { OnePager } from '../shared/reco';
import { api } from './api';
import './styles.css';

export default function App() {
  const [onePager, setOnePager] = useState<OnePager | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.generateOnePager(formData);
      setOnePager(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOnePager(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800">
              Notion Consultant Services Advisor
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Get personalized Notion recommendations for your clients to determine use cases 
            and services your business can provide on top of Notion
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {!onePager ? (
          <div>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-800">
                  Tell us about your client's use case
                </h2>
              </div>
              <p className="text-slate-600">
                Provide details about your client's business to get tailored recommendations and service opportunities
              </p>
            </div>
            <IntentForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
        ) : (
          <div>
            <button onClick={handleReset} className="btn btn-secondary mb-4">
              ← Back to Form
            </button>
            <OnePagerView data={onePager} />
          </div>
        )}
      </div>
    </div>
  );
}
