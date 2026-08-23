import { useState } from 'react';
import '../../styles/Tictactoe.css';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';

export default function Games() {
    const navigate = useNavigate();

    App.addListener('backButton', () => {
        navigate('/home');
    })

    const [nextPlayer, setNextPlayer] = useState('x');
    const [score, setScore] = useState({ x: 0, o: 0 });
    const [values, setValues] = useState({ "1": '', "2": '', "3": '', "4": '', "5": '', "6": '', "7": '', "8": '', '9': '' });
    const [gameStatus, setGameStatus] = useState('');
    const [lineStyle, setLineStyle] = useState({ display: 'none' });

    const getNextSVG = () => {
        return nextPlayer === 'x' ? '<svg viewBox="0 0 16 16"> <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" /> </svg>' : '<svg viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" /> </svg>';
    }

    const setLine = (pattern) => {
        switch (pattern) {
            case '123': setLineStyle({ display: 'block', width: 'calc((90vw/3) * 3)', height: '5px', top: 'calc((90vw/3) * 0.5)', left: '0', transform: 'none' }); break;
            case '456': setLineStyle({ display: 'block', width: 'calc((90vw/3) * 3)', height: '5px', top: 'calc((90vw/3) * 1.5)', left: '0', transform: 'none' }); break;
            case '789': setLineStyle({ display: 'block', width: 'calc((90vw/3) * 3)', height: '5px', top: 'calc((90vw/3) * 2.5)', left: '0', transform: 'none' }); break;
            case '147': setLineStyle({ display: 'block', height: 'calc((90vw/3) * 3)', width: '5px', left: 'calc((90vw/3) * 0.5)', top: '0', transform: 'none' }); break;
            case '258': setLineStyle({ display: 'block', height: 'calc((90vw/3) * 3)', width: '5px', left: 'calc((90vw/3) * 1.5)', top: '0', transform: 'none' }); break;
            case '369': setLineStyle({ display: 'block', height: 'calc((90vw/3) * 3)', width: '5px', left: 'calc((90vw/3) * 2.5)', top: '0', transform: 'none' }); break;
            case '159': setLineStyle({ display: 'block', height: 'calc((90vw/3) * 3)', width: '5px', top: '0', left: '50%', transform: 'rotate(135deg)' }); break;
            case '357': setLineStyle({ display: 'block', height: 'calc((90vw/3) * 3)', width: '5px', top: '0', left: '50%', transform: 'rotate(45deg)' }); break;
            default: setLineStyle({ display: 'none' });
        }
    }

    const checkGameStatus = (currentValues) => {
        const winPatterns = [
            { pattern: ['1', '2', '3'], line: '123' },
            { pattern: ['4', '5', '6'], line: '456' },
            { pattern: ['7', '8', '9'], line: '789' },
            { pattern: ['1', '4', '7'], line: '147' },
            { pattern: ['2', '5', '8'], line: '258' },
            { pattern: ['3', '6', '9'], line: '369' },
            { pattern: ['1', '5', '9'], line: '159' },
            { pattern: ['3', '5', '7'], line: '357' }
        ];

        for (let winPattern of winPatterns) {
            const [a, b, c] = winPattern.pattern;
            if (currentValues[a] && currentValues[a] === currentValues[b] && currentValues[a] === currentValues[c]) {
                return { winner: currentValues[a], isDraw: false, winningLine: winPattern.line };
            }
        }

        const allFilled = Object.values(currentValues).every((val) => val !== '');
        if (allFilled) {
            return { winner: null, isDraw: true, winningLine: null };
        }

        return { winner: null, isDraw: false, winningLine: null };
    };

    const resetBoard = () => {
        setValues({ "1": '', "2": '', "3": '', "4": '', "5": '', "6": '', "7": '', "8": '', '9': '' });
        setNextPlayer('x');
        setGameStatus('');
        setLineStyle({ display: 'none' });

        const buttons = document.querySelectorAll('#tictactoe .box');
        buttons.forEach(button => {
            button.innerHTML = '';
            button.disabled = false;
        });
    };

    function handleClick(e) {
        if (e.target.disabled) return;
        if (gameStatus) return;

        e.target.innerHTML = getNextSVG();
        e.target.disabled = true;

        const newValues = { ...values };
        newValues[e.target.value] = nextPlayer;
        setValues(newValues);

        const status = checkGameStatus(newValues);

        if (status.winner) {
            setScore(prev => ({
                ...prev,
                [status.winner]: prev[status.winner] + 1
            }));
            setLine(status.winningLine);
            setGameStatus(`winner_${status.winner}`);
            setTimeout(() => {
                resetBoard();
            }, 1500);
        } else if (status.isDraw) {
            setGameStatus('draw');
            setTimeout(() => {
                resetBoard();
            }, 1500);
        } else {
            setNextPlayer(nextPlayer === 'x' ? 'o' : 'x');
        }
    }

    return (
        <>
            <svg onClick={() => navigate('/')} className="bi bi-arrow-left" viewBox="0 0 16 16" style={{ position: 'fixed', top: '1em', left: '1.5em', width: '25px', fill: 'var(--primary-color)', zIndex: 10 }}>
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
            </svg>
            <div id='tictactoe'>
                <div className="scoreBoard">
                    <div>
                        <svg viewBox="0 0 16 16"> <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" /></svg>
                        <b>{score.x}</b>
                    </div>
                    <div>
                        <b>{score.o}</b>
                        <svg viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" /></svg>
                    </div>
                </div>
                <b style={{ position: 'absolute', top: '7.5em' }}>Next: {nextPlayer.toUpperCase()}</b>

                <div className="board">
                    <button className="box" style={{ borderLeft: 0, borderTop: 0 }} onClick={handleClick} value="1"></button>
                    <button className="box" style={{ borderTop: 0 }} onClick={handleClick} value="2"></button>
                    <button className="box" style={{ borderRight: 0, borderTop: 0 }} onClick={handleClick} value="3"></button>

                    <button className="box" style={{ borderLeft: 0 }} onClick={handleClick} value="4"></button>
                    <button className="box" onClick={handleClick} value="5"></button>
                    <button className="box" style={{ borderRight: 0 }} onClick={handleClick} value="6"></button>

                    <button className="box" style={{ borderLeft: 0, borderBottom: 0 }} onClick={handleClick} value="7"></button>
                    <button className="box" style={{ borderBottom: 0 }} onClick={handleClick} value="8"></button>
                    <button className="box" style={{ borderRight: 0, borderBottom: 0 }} onClick={handleClick} value="9"></button>
                    <div className='line' style={lineStyle}></div>
                </div>
            </div>
        </>
    )
}