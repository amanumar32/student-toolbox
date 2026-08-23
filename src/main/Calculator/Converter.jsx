import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import '../../styles/QuantityConverter.css';
import { unit } from "mathjs";
import { App } from "@capacitor/app";

export default function QuantityConverter() {
    const navigate = useNavigate();

    const [param, setParam] = useState('');
    const [iniVal, setIniVal] = useState('');
    const [compoundVals, setCompoundVals] = useState({ result: 0, color: 'var(--accent-color)', comment: '' });
    const [simpleUnits] = useState({ length: ['km', 'm', 'dm', 'cm', 'mm', 'mi', 'yd', 'ft', 'in'], area: ['km²', 'm²', 'dm²', 'cm²', 'mm²', 'acre', 'hectare', 'mi²', 'ft²'], volume: ['m³', 'dm³', 'cm³', 'l', 'dl', 'cl', 'ml', 'ft³', 'in³'], mass: ['kg', 'g', 'mg', 't', 'lb', 'oz'], temperature: ['°C', '°F', 'K'], time: ['year', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'], data: ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'], number_base: ['DEC', 'BIN', 'HEX', 'OCT'], currency: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "HKD", "NZD", "SEK", "KRW", "SGD", "INR", "ZAR", "BRL", "NGN"] });

    useEffect(() => {
        const URLParams = new URLSearchParams(window.location.search);
        const displayParam = URLParams.get('param');
        if (displayParam) setParam(displayParam);

    }, []);

    App.addListener('backButton', () => {
        navigate('/calculator');
    })

    async function simpleConvert() {
        const input = parseFloat(document.querySelector('#page-1 .simple #input').value) || 0;
        const from = document.querySelector('#page-1 .simple #from').value.replace(/²/g, '^2').replace(/³/g, '^3').replace(/°C/g, 'celsius').replace(/°F/g, 'fahrenheit').replace(/K/g, 'kelvin');
        const to = document.querySelector('#page-1 .simple #to').value.replace(/²/g, '^2').replace(/³/g, '^3').replace(/°C/g, 'celsius').replace(/°F/g, 'fahrenheit').replace(/K/g, 'kelvin');

        let result = '';
        try {
            if (simpleUnits[param].includes('DEC')) {
                result = parseInt(input, from.toLowerCase().replace(/dec/g, 10).replace(/bin/g, 2).replace(/hex/g, 16).replace(/oct/g, 8)).toString(to.toLowerCase().replace(/dec/g, 10).replace(/bin/g, 2).replace(/hex/g, 16).replace(/oct/g, 8))
            } else if (simpleUnits[param].includes('USD')) {
                const response = fetch(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`);
                const data = await response.then(res => res.json());
                result = (input * data.rates[to.toUpperCase()]).toFixed(2);
            } else {
                result = unit(input, from).toNumber(to);
            }
        } catch (error) {
            result = 'Error'
        }
        setIniVal(result);
    }

    function handleBMI() {
        const input1 = parseFloat(document.getElementById('input1').value) || 0;
        const input2 = parseFloat(document.getElementById('input2').value) || 0;
        const weightUnit = document.getElementById('weight').value;
        const heightUnit = document.getElementById('height').value;

        if (input2 === 0) {
            setCompoundVals({ result: 0, color: 'var(--accent-color)', comment: '' });
            return;
        }

        try {
            const weight = unit(input1, weightUnit).toNumber('kg');
            const height = unit(input2, heightUnit).toNumber('m');

            const bmi = (weight / (height * height)).toFixed(2);

            let color = '';
            let comment = '';
            if (bmi < 18.5) {
                color = 'var(--accent-color)';
                comment = 'Underweight';
            } else if (bmi < 25) {
                color = '#02fd62';
                comment = 'Normal';
            } else if (bmi < 30) {
                color = '#f79f12';
                comment = 'Overweight';
            } else {
                color = '#ff2b2b';
                comment = 'Obesity';
            }

            setCompoundVals({ result: bmi, color: color, comment: comment });
        } catch (error) {
            setCompoundVals({ result: 0, color: 'var(--accent-color)', comment: '' });
        }
    }

    function handleDiscount() {
        const input1 = parseFloat(document.getElementById('input1').value) || 0;
        const input2 = parseFloat(document.getElementById('input2').value) || 0;

        let result = '';
        let comment = '';
        try {
            result = (input1 - (input1 * (input2 / 100))).toFixed(2);
            comment = `You save ${input1 - result}`
        } catch (error) {
            result = '0';
        }
        setCompoundVals({ result, comment })
    }

    return (
        <div id="Converter">
            <div className="top-conv">
                <svg onClick={() => navigate('/calculator?page=convert')} class="bi bi-arrow-left" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                </svg>
                <b>{param.split('_').map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(' ')}</b>
                <i></i>
            </div>
            <div id="page-1">
                {
                    ['length', 'area', 'volume', 'mass', 'temperature', 'time', 'data', 'number_base', 'currency'].includes(param) && <div className="simple">
                        <div className="row">
                            <select id="from" onChange={simpleConvert}>{simpleUnits[param].map(opt => <option>{opt}</option>)}</select>
                            <input type="number" id="input" placeholder="0" onInput={simpleConvert} autoFocus />
                        </div>
                        <div className="row">
                            <select id="to" onChange={simpleConvert}>{simpleUnits[param].map(opt => <option>{opt}</option>)}</select>
                            <input type="text" id="output" placeholder="0" value={iniVal} readOnly />
                        </div>
                    </div>
                }
                {
                    ['BMI'].includes(param) && <div className="bmi">
                        <div className="row">
                            <select id="weight" onChange={handleBMI}>
                                <option>kg</option>
                                <option>lb</option>
                            </select>
                            <input type="number" id="input1" placeholder="0" onInput={handleBMI} autoFocus />
                            <p>Weight</p>
                        </div>
                        <div className="row">
                            <select id="height" onChange={handleBMI}>
                                <option>cm</option>
                                <option>ft</option>
                                <option>in</option>
                            </select>
                            <input type="number" id="input2" placeholder="0" onInput={handleBMI} />
                            <p>Height</p>
                        </div>
                        <div className="result">
                            <input style={{ color: compoundVals.color }} type="text" placeholder="0" readOnly value={compoundVals.result} />
                            <b>{compoundVals.comment}</b>
                        </div>
                    </div>
                }
                {
                    ['discount'].includes(param) && <div className="discount">
                        <div className="row">
                            <select disabled>
                                <option>Original Price</option>
                            </select>
                            <input type="number" id="input1" placeholder="0" onInput={handleDiscount} autoFocus />
                        </div>
                        <div className="row">
                            <select disabled>
                                <option>Discount (%)</option>
                            </select>
                            <input type="number" id="input2" placeholder="0" onInput={handleDiscount} />
                        </div>
                        <div className="result">
                            <input type="text" placeholder="0" readOnly value={compoundVals.result} />
                            <b>Final Price</b>
                            <br />
                            <i>{compoundVals.comment}</i>
                        </div>
                    </div>
                }
            </div>

        </div>
    )
}