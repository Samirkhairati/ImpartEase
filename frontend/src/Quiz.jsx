import { useState, useEffect } from "react"

const Quiz = ({ text }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isNextDisabled, setIsNextDisabled] = useState(true);
    const [quizLoading, setQuizLoading] = useState(false);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [difficulty, setDifficulty] = useState('');
    const [count, setCount] = useState('');

    const handleOptionClick = (selectedOption) => {
        const currentAnswer = questions[currentQuestion].answer;
        if (selectedOption === currentAnswer) {
            setSelectedOption(selectedOption);
            setScore(score + 1);
        } else {
            setSelectedOption(selectedOption);
        }
        setIsNextDisabled(false);
    };

    const handleNextClick = () => {
        setSelectedOption(null);
        setIsNextDisabled(true);
        if (currentQuestion + 1 != questions.length) setCurrentQuestion(currentQuestion + 1);
        else {
            setShowScore(true);
        }
    };

    const [questions, setQuestions] = useState([
        {
            "question": "",
            "options": [
                "",
                "",
                "",
                ""],
            "answer": ""
        }
    ])

    async function fetchQuiz() {
        try {
            setQuizLoading(true);
            const response = await fetch(`https://impartease.up.railway.app/generate/quiz/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "text": text,
                    "difficulty": difficulty,
                    "count": count

                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const quizData = await response.json();
            setQuestions(quizData.quiz);
        } catch (error) {
            console.error('Error fetching quiz:', error.message);
        } finally {
            setQuizLoading(false);
        }
    }


    return (
        <>

            <div className='flex gap-y-3 flex-col items-center w-full p-10 border-2 border-slate-700 rounded-xl'>
                <div className="flex gap-x-4 items-center">
                    <button className="btn btn-lg" onClick={() => fetchQuiz()}>Generate Quiz</button>

                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="select w-full max-w-xs">
                        <option disabled selected>Difficulty</option>
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                        <option>Extreme</option>
                    </select>
                    <select value={count} onChange={(e) => setCount(e.target.value)} className="select w-full max-w-xs">
                        <option disabled selected>Count</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6</option>
                        <option>7</option>
                        <option>8</option>
                        <option>9</option>
                        <option>10</option>
                    </select>
                </div>
                

                {
                    quizLoading ? <span className="loading loading-spinner loading-lg"></span>
                        :
                        <>
                            <h2 className='font-bold text-secondary text-lg'>QUIZ YOURSELF</h2>
                            {quizLoading ? '' : !showScore && <div className='flex'>
                                <span className='font-bold text-slate-400 w-20'>Q({currentQuestion + 1}/{questions.length})</span>
                                <p className='text-secondary ml-2'>{questions[currentQuestion].question}</p>
                            </div>}
                            <div>
                                {quizLoading ? 'Loading...' : !showScore ?
                                    questions[currentQuestion].options.map((option, index) => (
                                        <button
                                            key={index}
                                            className={`btn primary btn-sm w-full mt-5 ${selectedOption === option ? (option === questions[currentQuestion].answer ? 'bg-emerald-500 hover:bg-emerald-500 text-white' : 'bg-rose-500 hover:bg-rose-500 text-white') : ''}`}
                                            onClick={() => handleOptionClick(option)}
                                        >
                                            {option}
                                        </button>
                                    ))
                                    :
                                    <div className='flex flex-col items-center'>
                                        <h2 className='font-bold text-secondary text-lg'>You scored {score} out of {questions.length}</h2>

                                    </div>
                                }
                                {!showScore && <button className='btn btn-primary text-white btn-sm w-full mt-5' disabled={isNextDisabled} onClick={handleNextClick}>
                                    Next
                                </button>}
                            </div>
                        </>
                }
            </div >
        </>
    )
}

export default Quiz

