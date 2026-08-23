import { useEffect, useState } from "react";
import { configuration, dictionaryDB, device } from "../../lib/config";
import '../../styles/Dictionary.css';
import { useNavigate } from "react-router-dom";

export default function Dictionary() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [mode, setMode] = useState(configuration.get('dictionary-mode'));
    const [words, setWords] = useState([]);

    const [selectedWord, setSelectedWord] = useState(null);
    const [definition, setDefinition] = useState(null);

    useEffect(() => {
        async function onStart() {
            const available = await checkDictionary();
            setIsAvailable(available);
        }
        onStart();
    }, []);

    const checkDictionary = async () => {
        setLoading(true);
        if (mode === 'online') {
            setLoading(false);
            return true;
        }
        const testResult = await dictionaryDB.check();
        setLoading(false);
        return testResult;
    };

    const searchWord = async (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            setWords([]);
            return;
        }

        let results = [];
        if (mode === 'offline') {
            const obj = await dictionaryDB.lookup(query);
            results = obj.map(e => e.word);
        } else {
            const response = await fetch(`https://api.datamuse.com/words?sp=${query}*&max=15`);
            const data = await response.json();
            results = data.map(e => e.word);
        }
        setWords(results);
        setSelectedWord(null);
    };

    const getDefinition = async (word) => {
        if (selectedWord === word) {
            setSelectedWord(null);
            return;
        }

        let text = '';
        if (mode === 'offline') {
            const result = await dictionaryDB.lookup(word);
            text = result[0]?.definition || "No definition found.";
        } else {
            const response = await fetch(`https://api.datamuse.com/words?sp=${word}&md=d&max=1`);
            const data = await response.json();
            if (!data.length || !data[0].defs) {
                text = "No definition found.";
            } else {
                text = data[0].defs
                    .map((def, index) => {
                        const cleanDef = def.split('\t')[1] || def;
                        return `${index + 1}. ${cleanDef}`;
                    })
                    .join('\n');
            }
        }

        const parts = text.split(/(\d+\.\s)/g);
        const formatted = [];

        for (let i = 1; i < parts.length; i += 2) {
            const number = parts[i];
            const content = parts[i + 1]?.trim();
            if (content) formatted.push({ number, content });
        }

        let wordDefElement;
        if (formatted.length === 0) {
            wordDefElement = <p className="definition-text">{text}</p>;
        } else {
            wordDefElement = (
                <ol className="definition-list" style={{ paddingLeft: '1.2em' }}>
                    {formatted.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '5px' }}>
                            <span className="definition-content">{item.content}</span>
                        </li>
                    ))}
                </ol>
            );
        }

        setDefinition(wordDefElement);
        setSelectedWord(word);
    };

    if (loading) return <div className="spinner"></div>;

    if (downloading) return (
        <>
            <svg onClick={() => navigate('/')} className="bi bi-arrow-left" viewBox="0 0 16 16" style={{ position: 'fixed', top: '1em', left: '1.5em', width: '25px', fill: 'var(--primary-color)', zIndex: 10 }}>
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
            </svg>
            <h2 style={{ textAlign: 'center', marginTop: '25vh' }}>Downloading...</h2>
            <div className="spinner"></div>
        </>
    );

    if (!isAvailable) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg onClick={() => navigate('/')} className="bi bi-arrow-left" viewBox="0 0 16 16" style={{ position: 'fixed', top: '1em', left: '1.5em', width: '25px', fill: 'var(--primary-color)', zIndex: 10 }}>
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                </svg>
                <div id="dictionary-not-found">
                    <h2>Dictionary Not Found!</h2>
                    <span>The Dictionary Data has not been installed. Download it for offline use or switch to online mode.</span>
                    <br />
                    <div className="row" style={{ display: 'flex' }}>
                        <button onClick={async () => {
                            setDownloading(true);
                            const current = await dictionaryDB.check();
                            if (current) {
                                setDownloading(false);
                                device.toast('Dictionary already downloaded. Switching to offline mode.')
                                configuration.save('dictionary-mode', 'offline');
                                setMode('offline');
                                setIsAvailable(true);
                                return;
                            }
                            const response = await dictionaryDB.download();
                            if (response.success) {
                                configuration.save('dictionary-mode', 'offline');
                                setMode('offline');
                                setIsAvailable(true);
                                setDownloading(false);
                                device.toast('Downloaded successfully!')
                            } else {
                                device.toast('Download failed: ' + response.message, 'long');
                                setDownloading(false);
                            }
                        }}>Download</button>
                        <button onClick={() => {
                            configuration.save('dictionary-mode', 'online');
                            setMode('online');
                            setIsAvailable(true);
                        }}>Use online</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="Dictionary">
            <div className="top">
                <svg onClick={() => navigate('/')} className="bi bi-arrow-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                </svg>
                <b>Dictionary</b>
                <svg viewBox="0 0 16 16" style={{ backgroundColor: 'var(--secondary-color)', padding: '6px', borderRadius: '25px', width: '33px' }}
                    onClick={async () => {
                        setWords([]);
                        const newMode = mode === 'offline' ? 'online' : 'offline';
                        configuration.save('dictionary-mode', newMode);
                        setMode(newMode);
                        device.toast(`Switched to ${newMode} mode.`);
                        const current = await dictionaryDB.check();
                        if (!current && newMode === 'offline') location.reload();
                    }}>
                    {mode === 'offline' ? (
                        <path d="M3.112 5.112a3 3 0 0 0-.17.613C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13H11l-1-1H3.781C2.231 12 1 10.785 1 9.318c0-1.365 1.064-2.513 2.46-2.666l.446-.05v-.447q0-.113.018-.231zm2.55-1.45-.725-.725A5.5 5.5 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773a3.2 3.2 0 0 1-1.516 2.711l-.733-.733C14.498 11.378 15 10.626 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3c-.875 0-1.678.26-2.339.661z M13.646 14.354-12-12 .708-.708 12 12z" />
                    ) : (
                        <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" />
                    )}
                </svg>
            </div>
            <br /><br />
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Search..."
                    onInput={searchWord}
                    autoFocus
                    id="search-el"
                />
            </div>

            {words.length > 0 && words.map((itm, idx) => (
                <div
                    key={idx}
                    className="results"
                    onClick={() => getDefinition(itm)}
                    onDoubleClick={() => navigator.clipboard.writeText(itm)}
                >
                    <strong>{itm}</strong>
                    {selectedWord === itm && definition}
                </div>
            ))}
        </div>
    );
}