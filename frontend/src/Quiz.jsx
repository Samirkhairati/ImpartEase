import { useState, useEffect } from "react"

const Quiz = ({text}) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isNextDisabled, setIsNextDisabled] = useState(true);
    const [quizLoading, setQuizLoading] = useState(false);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);

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
                    "text": text
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
                <button className="btn btn-lg mb-5" onClick={() => fetchQuiz()}>Generate Quiz</button>
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

