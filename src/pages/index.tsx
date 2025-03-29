import { useState, useEffect, useRef } from 'react';

const Calculator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [transform, setTransform] = useState<string>('rotateX(0deg) rotateY(0deg)');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Modal state for exponent input (x^y)
  const [isExponentModalOpen, setIsExponentModalOpen] = useState(false);
  const [exponentValue, setExponentValue] = useState<string>('');

  // Modal state for fraction input
  const [isFractionModalOpen, setIsFractionModalOpen] = useState(false);
  const [fractionNumerator, setFractionNumerator] = useState<string>('');
  const [fractionDenom, setFractionDenom] = useState<string>('');

  // Ref for the history panel to auto-scroll to the bottom
  const historyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll history panel to bottom when history changes
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  // Append value to the current input
  const handleClick = (value: string) => {
    if (error) setError(null);
    setInput((prev) => prev + value);
  };

  // Evaluate the expression
  const calculate = () => {
    try {
      // Using eval for demonstration; consider a safe math library in production
      // eslint-disable-next-line no-eval
      const result = eval(input);
      setHistory((prev) => [...prev, `${input} = ${result}`]);
      setInput(result.toString());
      setHistoryIndex(-1);
    } catch (err) {
      setError('Invalid Expression');
    }
  };

  // Clear input and error
  const clear = () => {
    setInput('');
    setError(null);
    setHistoryIndex(-1);
  };

  // Remove the last character
  const backspace = () => {
    setInput((prev) => prev.slice(0, -1));
    if (error) setError(null);
    setHistoryIndex(-1);
  };

  // Handle scientific functions (except power and fraction which use modals)
  const handleScientific = (func: string) => {
    try {
      const num = parseFloat(input);
      if (isNaN(num)) {
        setError('Invalid Number');
        return;
      }
      let result: number;
      switch (func) {
        case 'sin':
          result = Math.sin(num);
          break;
        case 'cos':
          result = Math.cos(num);
          break;
        case 'tan':
          result = Math.tan(num);
          break;
        case 'log':
          result = Math.log(num);
          break;
        case 'sqrt':
          result = Math.sqrt(num);
          break;
        case 'exp':
          result = Math.exp(num);
          break;
        case 'square':
          result = num ** 2;
          break;
        case 'cube':
          result = num ** 3;
          break;
        case 'cuberoot':
          result = Math.cbrt(num);
          break;
        default:
          return;
      }
      setHistory((prev) => [...prev, `${func}(${input}) = ${result}`]);
      setInput(result.toString());
      setHistoryIndex(-1);
    } catch (err) {
      setError('Invalid Operation');
    }
  };

  // Submit exponent modal
  const handleExponentSubmit = () => {
    const base = parseFloat(input);
    const exp = parseFloat(exponentValue);
    if (isNaN(base) || isNaN(exp)) {
      setError('Invalid number or exponent');
      return;
    }
    const result = Math.pow(base, exp);
    setHistory((prev) => [...prev, `power(${input}, ${exponentValue}) = ${result}`]);
    setInput(result.toString());
    setIsExponentModalOpen(false);
    setExponentValue('');
    setHistoryIndex(-1);
  };

  // Submit fraction modal
  const handleFractionSubmit = () => {
    const num = parseFloat(fractionNumerator);
    const denom = parseFloat(fractionDenom);
    if (isNaN(num) || isNaN(denom) || denom === 0) {
      setError('Invalid fraction input');
      return;
    }
    const result = num / denom;
    setHistory((prev) => [...prev, `fraction(${fractionNumerator}/${fractionDenom}) = ${result}`]);
    setInput(result.toString());
    setIsFractionModalOpen(false);
    setFractionNumerator('');
    setFractionDenom('');
    setHistoryIndex(-1);
  };

  // Update 3D rotation based on pointer position
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;
    const rotateY = ((x - halfWidth) / halfWidth) * 10; // max 10° rotation
    const rotateX = -((y - halfHeight) / halfHeight) * 10;
    setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  // Reset rotation when pointer leaves
  const handleMouseLeave = () => {
    setTransform('rotateX(0deg) rotateY(0deg)');
  };

  // Handle key events for main calculator
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // If any modal is open, skip main key handling.
    if (isExponentModalOpen || isFractionModalOpen) return;

    if (event.key === 'ArrowUp') {
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        const historyItem = history[newIndex];
        const parts = historyItem.split('=');
        if (parts.length > 1) {
          setInput(parts[1].trim());
        }
      }
    } else if (event.key === 'ArrowDown') {
      if (history.length > 0) {
        if (historyIndex === -1) return;
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          const historyItem = history[newIndex];
          const parts = historyItem.split('=');
          if (parts.length > 1) {
            setInput(parts[1].trim());
          }
        } else {
          setHistoryIndex(-1);
          setInput('');
        }
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      calculate();
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      backspace();
    } else {
      const allowedKeys = "0123456789+-*/().";
      if (allowedKeys.includes(event.key)) {
        event.preventDefault();
        setInput((prev) => prev + event.key);
      }
    }
  };

  return (
    <div
      className="min-h-screen text-black bg-gradient-to-r from-blue-200 to-purple-200 p-4 flex items-center justify-center"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-4xl flex flex-col md:flex-row md:space-x-6">
        {/* Calculator Card */}
        <div
          className="bg-white rounded-lg shadow-lg p-6 mb-6 md:mb-0 flex-1 transition-transform duration-300"
          style={{ perspective: '1000px', transform }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Display Panel */}
          <div className="mb-4 p-3 bg-gray-100 rounded border border-gray-300">
            <input
              type="text"
              value={input}
              readOnly
              placeholder="0"
              className="w-full text-2xl font-bold text-right bg-transparent focus:outline-none"
            />
            {error && <div className="text-red-500 mt-1 text-sm">{error}</div>}
          </div>
   {/* Scientific Functions */}
   <div className="mt-4 grid grid-cols-5 gap-3">
            <button
              onClick={() => handleScientific('sin')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              sin
            </button>
            <button
              onClick={() => handleScientific('cos')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              cos
            </button>
            <button
              onClick={() => handleScientific('tan')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              tan
            </button>
            <button
              onClick={() => handleScientific('log')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              log
            </button>
            <button
              onClick={() => handleScientific('exp')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              exp
            </button>
            <button
              onClick={() => handleScientific('square')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              x²
            </button>
            <button
              onClick={() => handleScientific('cube')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              x³
            </button>
            <button
              onClick={() => handleScientific('cuberoot')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              ∛
            </button>
            <button
              onClick={() => setIsExponentModalOpen(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              x^
            </button>
            <button
              onClick={() => setIsFractionModalOpen(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              2/3
            </button>
        </div>


          {/* Main Calculator Buttons */}
          <div className="grid grid-cols-4 gap-3 mt-2">
            
            <button
              onClick={clear}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              C
            </button>
            <button
              onClick={backspace}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              ⌫
            </button>
            <button
              onClick={() => handleScientific('sqrt')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              √
            </button>
            <button
              onClick={() => handleClick('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              ÷
            </button>

            <button
              onClick={() => handleClick('7')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              7
            </button>
            <button
              onClick={() => handleClick('8')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              8
            </button>
            <button
              onClick={() => handleClick('9')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              9
            </button>
            <button
              onClick={() => handleClick('*')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              ×
            </button>

            <button
              onClick={() => handleClick('4')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              4
            </button>
            <button
              onClick={() => handleClick('5')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              5
            </button>
            <button
              onClick={() => handleClick('6')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              6
            </button>
            <button
              onClick={() => handleClick('-')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              −
            </button>

            <button
              onClick={() => handleClick('1')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              1
            </button>
            <button
              onClick={() => handleClick('2')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              2
            </button>
            <button
              onClick={() => handleClick('3')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              3
            </button>
            <button
              onClick={() => handleClick('+')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              +
            </button>

            <button
              onClick={() => handleClick('0')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded transition-transform transform hover:scale-105 col-span-2"
            >
              0
            </button>
            <button
              onClick={() => handleClick('.')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              .
            </button>
            <button
              onClick={calculate}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded transition-transform transform hover:scale-105"
            >
              =
            </button>
          </div>
          </div>

       

        {/* Calculation History Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex-1">
          <h2 className="text-xl font-bold mb-2">Calculation History</h2>
          <div ref={historyRef} className="max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-gray-500">No calculations yet.</p>
            ) : (
              history.map((entry, index) => (
                <div key={index} className="border-b border-gray-200 py-1 text-gray-700">
                  {entry}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Exponent Modal */}
      {isExponentModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-10">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Enter Exponent</h2>
            <input
              type="number"
              value={exponentValue}
              onChange={(e) => setExponentValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleExponentSubmit(); } }}
              className="border border-gray-300 rounded p-2 mb-4 w-full"
              placeholder="Exponent"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsExponentModalOpen(false);
                  setExponentValue('');
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleExponentSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Calculate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fraction Modal */}
      {isFractionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg bg-opacity-10">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Enter Fraction</h2>
            <input
              type="number"
              value={fractionNumerator}
              onChange={(e) => setFractionNumerator(e.target.value)}
              className="border border-gray-300 rounded p-2 mb-4 w-full"
              placeholder="Numerator"
            />
            <input
              type="number"
              value={fractionDenom}
              onChange={(e) => setFractionDenom(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleFractionSubmit(); } }}
              className="border border-gray-300 rounded p-2 mb-4 w-full"
              placeholder="Denominator"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsFractionModalOpen(false);
                  setFractionNumerator('');
                  setFractionDenom('');
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleFractionSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Calculate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
