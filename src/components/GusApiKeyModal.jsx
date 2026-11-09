import React, { useState } from 'react';
import { 
  FaXmark, 
  FaKey, 
  FaCheck, 
  FaTriangleExclamation, 
  FaArrowRotateRight,
  FaShieldHalved
} from 'react-icons/fa6';
import { testGusBdlConnection } from '../services/gusBdlApi';

export default function GusApiKeyModal({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
  apiStatus,
  setApiStatus
}) {
  const [inputKey, setInputKey] = useState(currentKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    const result = await testGusBdlConnection(inputKey);
    setIsTesting(false);
    setTestResult(result);
    if (result.success) {
      setApiStatus('CONNECTED');
    }
  };

  const handleSave = () => {
    onSaveKey(inputKey);
    onClose();
  };

  return (
    <div className="gus-modal-backdrop" onClick={onClose}>
      <div className="gus-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="gus-modal-header">
          <div className="modal-title-group">
            <FaShieldHalved size={18} className="modal-icon" />
            <h3>Konfiguracja Klucza API BDL (GUS)</h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <FaXmark size={18} />
          </button>
        </div>

        <div className="gus-modal-body">
          <p className="modal-description">
            Klucz API BDL (Banku Danych Lokalnych GUS) autoryzuje zapytania do oficjalnego endpointu{' '}
            <code>https://bdl.stat.gov.pl/api/v1/</code> w nagłówku <code>X-ClientId</code>.
          </p>

          <div className="key-input-container">
            <label htmlFor="gus-api-key-input" className="key-input-label">
              Klucz API (zmienna <code>VITE_GUS_API_KEY</code> w pliku <code>.env</code>):
            </label>
            <div className="key-input-wrapper">
              <FaKey className="key-icon" size={14} />
              <input
                id="gus-api-key-input"
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="np. 2ead5bb5-9ea5-4686-66f1-08df3e66a85a"
                className="key-input"
              />
            </div>
            <span className="key-hint">
              Klucz zdefiniowany domyślnie w <code>data/.env</code> i <code>.env</code>: <code>2ead5bb5-9ea5-4686-66f1-08df3e66a85a</code>
            </span>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div className={`test-feedback-box ${testResult.success ? 'feedback-success' : 'feedback-notice'}`}>
              {testResult.success ? (
                <>
                  <FaCheck size={16} />
                  <div>
                    <strong>Połączono z GUS BDL API!</strong>
                    <p>{testResult.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <FaTriangleExclamation size={16} />
                  <div>
                    <strong>Tryb zsynchronizowanych danych GUS:</strong>
                    <p>{testResult.message}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="gus-modal-footer">
          <button
            type="button"
            className="btn-modal-test"
            onClick={handleTest}
            disabled={isTesting}
          >
            <FaArrowRotateRight size={13} className={isTesting ? 'gus-spin' : ''} />
            <span>{isTesting ? 'Testowanie...' : 'Testuj połączenie BDL'}</span>
          </button>

          <div className="footer-actions-right">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Anuluj
            </button>
            <button type="button" className="btn-modal-save" onClick={handleSave}>
              Zapisz klucz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

