import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './main/Home';
import Calculator from './main/Calculator/Calculator';
import QuantityConverter from './main/Calculator/Converter';
import PDFViewer from './main/Documents/reader';
import Scanner from './main/Documents/scanner';
import Tictactoe from './main/Games/Tictactoe';
import Dictionary from './main/Dictionary/Dictionary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/calculator/converter" element={<QuantityConverter />} />
        <Route path="/reader" element={<PDFViewer />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/tictactoe" element={<Tictactoe />} />
        <Route path="/dictionary" element={<Dictionary />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;