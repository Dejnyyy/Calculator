import { useState } from "react";

const Calculator = () => {
  const [input, setInput] = useState("");

  const handleButtonClick = (value) => {
    if (value === "=") {
      try {
        setInput(eval(input).toString());
      } catch {
        setInput("Error");
      }
    } else if (value === "C") {
      setInput("");
    } else {
      setInput(input + value);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-purple-500 to-indigo-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-80">
        <div className="text-right text-4xl font-bold mb-4 text-gray-800">{input}</div>
        <div className="grid grid-cols-4 gap-4">
          {["7", "8", "9", "/"].map((button) => (
            <button
              key={button}
              onClick={() => handleButtonClick(button)}
              className="bg-blue-500 text-white py-4 rounded-lg text-2xl hover:bg-blue-400 transition-all"
            >
              {button}
            </button>
          ))}
          {["4", "5", "6", "*"].map((button) => (
            <button
              key={button}
              onClick={() => handleButtonClick(button)}
              className="bg-blue-500 text-white py-4 rounded-lg text-2xl hover:bg-blue-400 transition-all"
            >
              {button}
            </button>
          ))}
          {["1", "2", "3", "-"].map((button) => (
            <button
              key={button}
              onClick={() => handleButtonClick(button)}
              className="bg-blue-500 text-white py-4 rounded-lg text-2xl hover:bg-blue-400 transition-all"
            >
              {button}
            </button>
          ))}
          {["0", ".", "=", "+"].map((button) => (
            <button
              key={button}
              onClick={() => handleButtonClick(button)}
              className="bg-blue-500 text-white py-4 rounded-lg text-2xl hover:bg-blue-400 transition-all"
            >
              {button}
            </button>
          ))}
          <button
            onClick={() => handleButtonClick("C")}
            className="col-span-4 bg-red-500 text-white py-4 rounded-lg text-2xl hover:bg-red-400 transition-all"
          >
            C
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
