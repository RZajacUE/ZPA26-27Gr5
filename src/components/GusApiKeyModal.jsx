import React, { useState } from 'react';
import { 
  FaXmark, 
  FaKey, 
  FaCheck, 
  FaTriangleExclamation, 
  FaArrowRotateRight,
  FaShieldHalved,
  FaRotateLeft,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa6';
import { 
  testGusBdlConnection, 
  DEFAULT_GUS_API_KEY, 
  isValidGusApiKey, 
  maskApiKey 
} from '../services/gusBdlApi';

export default function GusApiKeyModal({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
  setApiStatus
}) {
  const [inputKey, setInputKey] = useState(currentKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const isFormatValid = isValidGusApiKey(inputKey);

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
    if (isFormatValid) {
      onSaveKey(inputKey.trim());
      onClose();
    }
  };

  const handleResetDefault = () => {
    setInputKey(DEFAULT_GUS_API_KEY);
    setTestResult(null);
  };

  return (
    <div className="gus-modal-backdrop" onClick={onClose}>
      <div className="gus-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="gus-modal-header">
          <div className="modal-title-group">
            <FaShieldHalved size={18} className="modal-icon" />
            <h3>Konfiguracja Klucza API BDL (GUS)</h3>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Zamknij okno">
            <FaXmark size={18} />
          </button>
        </div>

        <div className="gus-modal-body">
          <p className="modal-description">
            Klucz API BDL (Bank Danych Lokalnych GUS) autoryzuje zapytania do oficjalnego endpointu{' '}
            <code>https://bdl.stat.gov.pl/api/v1/</code> w nagłówku <code>X-ClientId</code>.
          </p>

          <div className="key-input-container">
            <div className="key-input-label-row">
              <label htmlFor="gus-api-key-input" className="key-input-label">
                Wprowadź klucz API (format UUID):
              </label>
              <button
                type="button"
                className="btn-toggle-visibility"
                onClick={() => setShowKey(!showKey)}
                title={showKey ? 'Ukryj klucz' : 'Pokaż klucz'}
              >
                {showKey ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                <span>{showKey ? 'Ukryj' : 'Odkryj'}</span>
              </button>
            </div>

            <div className="key-input-wrapper">
              <FaKey className="key-icon" size={14} />
              <input
                id="gus-api-key-input"
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="np. 2ead5bb5-9ea5-4686-66f1-08df3e66a85a"
                className={`key-input ${inputKey ? (isFormatValid ? 'valid-input' : 'invalid-input') : ''}`}
              />
            </div>

            {/* Regex Validation Status */}
            {inputKey ? (
              <div className={`key-regex-status ${isFormatValid ? 'valid' : 'invalid'}`}>
                {isFormatValid ? (
                  <>
                    <FaCheck size={12} />
                    <span>Format UUID poprawny (8-4-4-4-12 hex)</span>
                  </>
                ) : (
                  <>
                    <FaTriangleExclamation size={12} />
                    <span>Nieprawidłowy format. Wymagany format: 8-4-4-4-12 znaków (np. 12345678-abcd-ef01-2345-6789abcdef01)</span>
                  </>
                )}
              </div>
            ) : (
              <span className="key-hint">
                Domyślny klucz pochodzi z pliku <code>.env</code> ({maskApiKey(DEFAULT_GUS_API_KEY)})
              </span>
            )}

            <div className="key-modal-subactions">
              <button 
                type="button" 
                className="btn-sub-revert" 
                onClick={handleResetDefault}
              >
                <FaRotateLeft size={11} />
                <span>Przywróć domyślny klucz z .env</span>
              </button>
            </div>
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
            disabled={isTesting || !isFormatValid}
          >
            <FaArrowRotateRight size={13} className={isTesting ? 'gus-spin' : ''} />
            <span>{isTesting ? 'Testowanie...' : 'Testuj połączenie BDL'}</span>
          </button>

          <div className="footer-actions-right">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Anuluj
            </button>
            <button 
              type="button" 
              className="btn-modal-save" 
              onClick={handleSave}
              disabled={!isFormatValid}
            >
              Zapisz klucz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
