import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { evaluate, sin, cos, tan, unit, asin, acos, atan } from 'mathjs';
import { configuration } from '../../lib/config';
import '../../styles/Calculator.css';
import { App } from '@capacitor/app';

export default function Calculator() {
    const navigate = useNavigate();

    const [highlighted, setHighlighted] = useState('main');
    const [calcHistory, setCalcHistory] = useState(configuration.get('calculator-history', []));
    const [iniVal, setIniVal] = useState('');
    const [scientific, setScientific] = useState(false);
    const [isShifted, setShifted] = useState(false);
    const [angleMode, setAngleMode] = useState('deg');

    useEffect(() => {
        const URLParams = new URLSearchParams(window.location.search);
        const displayParam = URLParams.get('page');
        if (displayParam) setHighlighted(displayParam);

        const scrollToBottom = () => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        };

        App.addListener('backButton', () => {
            navigate('/home');
        })

        const timeout = setTimeout(scrollToBottom, 10);

        return () => clearTimeout(timeout);
    }, [scientific, calcHistory, iniVal]);

    function appendText(value) {
        let val = iniVal;
        if (val.includes('.') && value === '.') return;
        val += value
        setIniVal(val);
        setTimeout(() => document.querySelector('.calc-output').scrollLeft = (document.querySelector('.calc-output').scrollWidth))
    }

    document.addEventListener('click', (e) => {
        if (e.target !== document.querySelector('.top #openOptions')) {
            document.querySelector('.menu').classList.add('hidden')
        } else {
            document.querySelector('.menu').classList.remove('hidden')
        }
    })
    return (
        <div className="body" id='Calculator'>
            <div className='top'>
                <svg onClick={() => navigate('/')} class="bi bi-arrow-left" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                </svg>
                <svg className={highlighted === 'main' ? 'highlight' : ''} onClick={() => setHighlighted('main')} viewBox="0 0 16 16">
                    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm2 .5v2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5m0 4v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5M4.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 12.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5M7.5 6a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM7 9.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5m.5 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM10 6.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5m.5 2.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5z" />
                </svg>
                <svg className={highlighted !== 'main' ? 'highlight' : ''} onClick={() => setHighlighted('convert')} viewBox="0 0 16 16">
                    <path d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2-3.502 2.001a.5.5 0 0 1-.496 0l-3.75-2.143A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434zM4.25 7.504 1.508 9.071l2.742 1.567 2.742-1.567zM7.5 9.933l-2.75 1.571v3.134l2.75-1.571zm1 3.134 2.75 1.571v-3.134L8.5 9.933zm.508-3.996 2.742 1.567 2.742-1.567-2.742-1.567zm2.242-2.433V3.504L8.5 5.076V8.21zM7.5 8.21V5.076L4.75 3.504v3.134zM5.258 2.643 8 4.21l2.742-1.567L8 1.076zM15 9.933l-2.75 1.571v3.134L15 13.067zM3.75 14.638v-3.134L1 9.933v3.134z" />
                </svg>
                <svg id='openOptions' class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                </svg>
                <div className="menu hidden">
                    {highlighted === 'main' ? <button onClick={() => {
                        configuration.save('calculator-history', []);
                        setCalcHistory(configuration.get('calculator-history', []));
                    }}>Clear history</button> : ''}
                </div>
            </div>
            {
                highlighted === 'main' && <div id="page-1">
                    <div className="display">
                        <div className='history-output' style={{ height: scientific ? '30vh' : '40vh' }}>
                            {calcHistory.map(item => <p onClick={async (e) => await navigator.clipboard.writeText(e.target.innerHTML)}>{item}</p>)}
                        </div>
                        <input className='calc-output' type='text' placeholder='0' value={iniVal} readOnly onClick={async () => await navigator.clipboard.writeText(iniVal)} />
                    </div>
                    <div className="display">
                        <div className={scientific ? 'scientific' : 'buttons'}>
                            <button onClick={() => setShifted(!isShifted)} style={{ backgroundColor: isShifted ? 'var(--accent-color)' : '', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={scientific ? '' : 'hidden'}>
                                <svg style={{ width: '20px', fill: 'var(--tertiary-color)' }} viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5" />
                                </svg>
                            </button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => setAngleMode(angleMode === 'rad' ? 'deg' : 'rad')}>{angleMode === 'rad' ? 'rad' : 'deg'}</button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText(isShifted ? 'asin(' : 'sin(')}>{isShifted ? 'asin' : 'sin'}</button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText(isShifted ? 'acos(' : 'cos(')}>{isShifted ? 'acos' : 'cos'}</button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText(isShifted ? 'atan(' : 'tan(')}>{isShifted ? 'atan' : 'tan'}</button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText('^')}>x<sup>x</sup></button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText('log(')}>log</button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText('log10(')}>ln</button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText('(')}>(</button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText(')')}>)</button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText('√(')}>√x</button>
                            <button onClick={() => setIniVal('')} style={{ color: 'var(--accent-color)' }}>AC</button>
                            <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => {
                                let res = iniVal;
                                if (iniVal === 'Error' || iniVal === 'Infinity' || !iniVal) {
                                    res = '';
                                } else {
                                    res = res.slice(0, -1);
                                }
                                setIniVal(res);
                            }}><svg style={{ width: '20px', fill: 'var(--accent-color)' }} className="bi bi-backspace-fill" viewBox="0 0 16 16">
                                    <path d="M15.683 3a2 2 0 0 0-2-2h-7.08a2 2 0 0 0-1.519.698L.241 7.35a1 1 0 0 0 0 1.302l4.843 5.65A2 2 0 0 0 6.603 15h7.08a2 2 0 0 0 2-2zM5.829 5.854a.5.5 0 1 1 .707-.708l2.147 2.147 2.146-2.147a.5.5 0 1 1 .707.708L9.39 8l2.146 2.146a.5.5 0 0 1-.707.708L8.683 8.707l-2.147 2.147a.5.5 0 0 1-.707-.708L7.976 8z" />
                                </svg></button>
                            <button style={{ color: 'var(--accent-color)' }} onClick={() => appendText('%')}>%</button>
                            <button style={{ color: 'var(--accent-color)' }} onClick={() => appendText('÷')}>÷</button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText('!')}>x!</button>
                            <button onClick={() => appendText('7')}>7</button>
                            <button onClick={() => appendText('8')}>8</button>
                            <button onClick={() => appendText('9')}>9</button>
                            <button style={{ color: 'var(--accent-color)' }} onClick={() => appendText('×')}>×</button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText('⁻¹')}>x⁻¹</button>
                            <button onClick={() => appendText('4')}>4</button>
                            <button onClick={() => appendText('5')}>5</button>
                            <button onClick={() => appendText('6')}>6</button>
                            <button style={{ color: 'var(--accent-color)' }} onClick={() => appendText('-')}>-</button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText('π')}>π</button>
                            <button onClick={() => appendText('3')}>3</button>
                            <button onClick={() => appendText('2')}>2</button>
                            <button onClick={() => appendText('1')}>1</button>
                            <button style={{ color: 'var(--accent-color)' }} onClick={() => appendText('+')}>+</button>
                            <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} id='rot-but' onClick={() => {
                                const e = document.querySelector('#rot-but')
                                e.classList.add('rotate');
                                setTimeout(() => {
                                    e.classList.remove('rotate');
                                    setScientific(!scientific);
                                    window.scrollTo(0, document.body.scrollHeight);
                                }, 400);
                            }}><svg style={{ fill: 'var(--accent-color)' }} class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
                                    <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z" />
                                </svg></button>
                            <button className={scientific ? '' : 'hidden'} onClick={() => appendText('e')}>e</button>
                            <button onClick={() => appendText('0')}>0</button>
                            <button onClick={() => appendText('.')}>.</button>
                            <button style={{ backgroundColor: 'var(--accent-color)' }} onClick={() => {
                                if (!iniVal) return;
                                let expression = iniVal.replace(/÷/g, '/').replace(/×/g, '*').replace(/√/g, 'sqrt').replace(/π/g, 'pi').replace(/⁻¹/g, '^-1');

                                const openBrackets = (expression.match(/\(/g) || []).length;
                                const closeBrackets = (expression.match(/\)/g) || []).length;
                                for (let i = 0; i < (openBrackets - closeBrackets); i++) {
                                    expression += ')';
                                }

                                let result = '';
                                try {
                                    if (angleMode === 'deg') {
                                        result = `${evaluate(expression, {
                                            sin: x => sin(unit(x, 'deg')),
                                            cos: x => cos(unit(x, 'deg')),
                                            tan: x => tan(unit(x, 'deg')),
                                            asin: x => unit(asin(x), 'rad').toNumber('deg'),
                                            acos: x => unit(acos(x), 'rad').toNumber('deg'),
                                            atan: x => unit(atan(x), 'rad').toNumber('deg'),
                                        })}`;
                                    } else {
                                        result = `${evaluate(expression)}`;
                                    }
                                    const data = configuration.get('calculator-history', []);
                                    data.push(`${iniVal} = ${result}`);
                                    configuration.save('calculator-history', data);
                                    setCalcHistory(configuration.get('calculator-history', []));
                                } catch (error) {
                                    result = 'Error';
                                }
                                setIniVal(result);

                            }}>=</button>
                        </div>
                    </div>

                </div>
            }
            {
                highlighted !== 'main' && <div id='page-2'>
                    <button onClick={() => navigate('/calculator/converter?param=length')}>
                        <svg class="bi bi-rulers" viewBox="0 0 16 16">
                            <path d="M1 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5v-1H2v-1h4v-1H4v-1h2v-1H2v-1h4V9H4V8h2V7H2V6h4V2h1v4h1V4h1v2h1V2h1v4h1V4h1v2h1V2h1v4h1V1a1 1 0 0 0-1-1z" />
                        </svg>
                        <p>Length</p>
                    </button>
                    <button onClick={() => navigate('/calculator/converter?param=area')}>
                        <svg class="bi bi-arrow-up-left-square" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm10.096 8.803a.5.5 0 1 0 .707-.707L6.707 6h2.768a.5.5 0 1 0 0-1H5.5a.5.5 0 0 0-.5.5v3.975a.5.5 0 0 0 1 0V6.707z" />
                        </svg>
                        <p>Area</p>
                    </button>
                    <button onClick={() => navigate('/calculator/converter?param=volume')}>
                        <svg class="bi bi-box2" viewBox="0 0 16 16">
                            <path d="M2.95.4a1 1 0 0 1 .8-.4h8.5a1 1 0 0 1 .8.4l2.85 3.8a.5.5 0 0 1 .1.3V15a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4.5a.5.5 0 0 1 .1-.3zM7.5 1H3.75L1.5 4h6zm1 0v3h6l-2.25-3zM15 5H1v10h14z" />
                        </svg>
                        <p>Volume</p>
                    </button>
                    <button onClick={() => navigate('/calculator/converter?param=mass')}>
                        <svg viewBox="0 0 24 24">
                            <path fill="none" d="M0 0H24V24H0z"></path><path d="M13 2v1.278l5 1.668 3.632-1.21.633 1.896-3.032 1.011 3.096 8.512C21.237 16.292 19.7 17 18 17c-1.701 0-3.237-.708-4.329-1.845l3.094-8.512L13 5.387V19H17v2H7v-2h4V5.387L7.232 6.643l3.096 8.512C9.237 16.292 7.7 17 6 17c-1.701 0-3.237-.708-4.329-1.845l3.094-8.512-3.03-1.01.633-1.898L6 4.945l5-1.667V2h2zm5 7.103L16.582 13h2.835L18 9.103zm-12 0L4.582 13h2.835L6 9.103z"></path>
                        </svg>
                        <p>Mass</p>
                    </button>
                    <button onClick={() => navigate('/calculator/converter?param=temperature')}>
                        <svg class="bi bi-thermometer-low" viewBox="0 0 16 16">
                            <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V9.5a.5.5 0 0 1 1 0v1.585a1.5 1.5 0 0 1 1 1.415" />
                            <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1" />
                        </svg>
                        <p>Temperature</p>
                    </button>
                    <button onClick={() => navigate('/calculator/converter?param=time')}>
                        <svg class="bi bi-clock" viewBox="0 0 16 16">
                            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
                        </svg>
                        <p>Time</p>
                    </button>
                    <button onClick={() => navigate('/calculator/converter?param=data')}>
                        <svg viewBox="0 0 1024 1024">
                            <path d="M372.288 745.792a394.048 394.048 0 0 0 113.728 102.848v-127.744a390.08 390.08 0 0 0-113.728 24.896z m-51.584 24.192a392.96 392.96 0 0 0-60.16 41.6h-1.28a390.336 390.336 0 0 0 205.696 89.6 450.24 450.24 0 0 1-144.256-131.2z m-24.704-230.016c3.968 56.768 20.096 110.208 45.696 157.696a445.696 445.696 0 0 1 144.32-32.896v-124.8h-190.08z m-56.128 0H120.96a390.4 390.4 0 0 0 98.56 233.024c22.208-19.2 46.272-36.224 71.808-50.752a445.312 445.312 0 0 1-51.456-182.272z m445.824 158.784c25.984-47.808 42.24-101.568 46.336-158.72H540.992v124.864c51.072 3.2 99.776 14.976 144.704 33.92z m50.24 24.96c24.448 14.08 47.552 30.464 68.928 48.896a390.4 390.4 0 0 0 98.176-232.576h-114.88a445.312 445.312 0 0 1-52.224 183.68z m-194.944 125.44a394.048 394.048 0 0 0 113.92-102.4 389.888 389.888 0 0 0-113.92-25.728v128.192z m23.104 51.392a390.4 390.4 0 0 0 200.704-88.96h-0.512a392.96 392.96 0 0 0-57.92-40.32 450.24 450.24 0 0 1-142.272 129.28zM341.76 326.144a389.632 389.632 0 0 0-45.76 157.824h190.016V358.976a445.696 445.696 0 0 1-144.256-32.768z m-50.368-24.576a449.216 449.216 0 0 1-71.808-50.56 390.4 390.4 0 0 0-98.56 232.96h118.848a445.312 445.312 0 0 1 51.52-182.4z m194.56-126.208A394.048 394.048 0 0 0 372.48 278.016a390.08 390.08 0 0 0 113.536 24.768V175.36z m-20.992-52.544a390.272 390.272 0 0 0-205.312 89.152h0.512c18.88 15.872 39.168 29.888 60.608 41.92a450.24 450.24 0 0 1 144.192-131.072z m189.76 154.048a394.048 394.048 0 0 0-113.728-102.08v127.808a389.952 389.952 0 0 0 113.728-25.728z m51.392-24.576a392.96 392.96 0 0 0 57.856-40.32h0.384A390.336 390.336 0 0 0 564.16 123.52a450.24 450.24 0 0 1 141.952 128.832z m25.92 231.68a389.632 389.632 0 0 0-46.528-159.168 445.568 445.568 0 0 1-144.512 33.92v125.248h191.04z m56.128 0h114.88a390.4 390.4 0 0 0-98.56-232.96 449.28 449.28 0 0 1-68.736 48.896c29.824 55.424 48.32 117.76 52.416 184.128zM512 960A448 448 0 1 1 512 64a448 448 0 0 1 0 896z"></path>
                        </svg>
                        <p>Data</p>
                    </button>
                    <button onClick={() => navigate('/calculator/converter?param=number_base')}>
                        <svg viewBox="0 0 16 16">
                            <path d="M2.873 11.297V4.142H1.699L0 5.379v1.137l1.64-1.18h.06v5.961zm3.213-5.09v-.063c0-.618.44-1.169 1.196-1.169.676 0 1.174.44 1.174 1.106 0 .624-.42 1.101-.807 1.526L4.99 10.553v.744h4.78v-.99H6.643v-.069L8.41 8.252c.65-.724 1.237-1.332 1.237-2.27C9.646 4.849 8.723 4 7.308 4c-1.573 0-2.36 1.064-2.36 2.15v.057zm6.559 1.883h.786c.823 0 1.374.481 1.379 1.179.01.707-.55 1.216-1.421 1.21-.77-.005-1.326-.419-1.379-.953h-1.095c.042 1.053.938 1.918 2.464 1.918 1.478 0 2.642-.839 2.62-2.144-.02-1.143-.922-1.651-1.551-1.714v-.063c.535-.09 1.347-.66 1.326-1.678-.026-1.053-.933-1.855-2.359-1.845-1.5.005-2.317.88-2.348 1.898h1.116c.032-.498.498-.944 1.206-.944.703 0 1.206.435 1.206 1.07.005.64-.504 1.106-1.2 1.106h-.75z" />
                        </svg>
                        <p>Number Base</p>
                    </button>
                    <button onClick={() => navigate('/calculator/converter?param=discount')}>
                        <svg class="bi bi-tag-fill" viewBox="0 0 16 16">
                            <path d="M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                        </svg>
                        <p>Discount</p>
                    </button>
                    <button onClick={() => navigate('/calculator/converter?param=BMI')}>
                        <svg viewBox="0 0 24 24">
                            <path d="M10 22H14C19 22 21 20 21 15V9C21 4 19 2 14 2H10C5 2 3 4 3 9V15C3 20 5 22 10 22Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M17.25 8.29004C14.26 5.63004 9.74 5.63004 6.75 8.29004L8.93 11.79C10.68 10.23 13.32 10.23 15.07 11.79L17.25 8.29004Z" stroke="var(--secondary-color)" fill='var(--secondary-color)' stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                        <p>BMI</p>
                    </button>
                    <button onClick={() => navigate('/calculator/converter?param=currency')}>
                        <svg class="bi bi-currency-exchange" viewBox="0 0 16 16">
                            <path d="M0 5a5 5 0 0 0 4.027 4.905 6.5 6.5 0 0 1 .544-2.073C3.695 7.536 3.132 6.864 3 5.91h-.5v-.426h.466V5.05q-.001-.07.004-.135H2.5v-.427h.511C3.236 3.24 4.213 2.5 5.681 2.5c.316 0 .59.031.819.085v.733a3.5 3.5 0 0 0-.815-.082c-.919 0-1.538.466-1.734 1.252h1.917v.427h-1.98q-.004.07-.003.147v.422h1.983v.427H3.93c.118.602.468 1.03 1.005 1.229a6.5 6.5 0 0 1 4.97-3.113A5.002 5.002 0 0 0 0 5m16 5.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0m-7.75 1.322c.069.835.746 1.485 1.964 1.562V14h.54v-.62c1.259-.086 1.996-.74 1.996-1.69 0-.865-.563-1.31-1.57-1.54l-.426-.1V8.374c.54.06.884.347.966.745h.948c-.07-.804-.779-1.433-1.914-1.502V7h-.54v.629c-1.076.103-1.808.732-1.808 1.622 0 .787.544 1.288 1.45 1.493l.358.085v1.78c-.554-.08-.92-.376-1.003-.787zm1.96-1.895c-.532-.12-.82-.364-.82-.732 0-.41.311-.719.824-.809v1.54h-.005zm.622 1.044c.645.145.943.38.943.796 0 .474-.37.8-1.02.86v-1.674z" />
                        </svg>
                        <p>Currency</p>
                    </button>
                </div>
            }
        </div>
    )
}