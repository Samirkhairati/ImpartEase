
import './App.css'
import Quiz from './Quiz'
import { FaLink } from "react-icons/fa6";
import { useState } from 'react'
import Markdown from 'react-markdown';
import { MdFactCheck } from "react-icons/md";

function App() {

  const [youtube, setYoutube] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);

  };

  async function uploadPDF(pdfFilePath) {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('pdf_file', file);

      const response = await fetch(`https://impartease.up.railway.app/generate/summary/pdf`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setText(result.summary);
      console.log('PDF uploaded successfully:', result);
    } catch (error) {
      console.error('Error uploading PDF:', error.message);
    } finally {
      setLoading(false);
    }
  }


  async function fetchText() {
    try {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/)/;
      if (!youtube.match(youtubeRegex)) {
        throw new Error('Invalid YouTube link');
      }
      setLoading(true);
      const response = await fetch(`https://impartease.up.railway.app/generate/summary/youtube`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "link": youtube
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const text2 = await response.json();
      setText(text2.summary || text2.error);
      console.log(text);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className='w-full h-screen flex flex-row text-white'>
        <div className='w-1/2 h-full px-10 py-10 flex flex-col gap-y-7 items-center'>
          <h1 className='text-5xl font-extrabold text-secondary mb-5 flex gap-x-4'><span><MdFactCheck /></span>ImpartEase</h1>
          <input onChange={handleFileChange} accept='.pdf' type="file" className="w-full file-input file-input-bordered file-input-lg" />
          <h1 className='text-center w-full text-xl font-bold text-secondary'>- OR -</h1>
          <label className="py-7 input input-bordered flex items-center gap-2 w-full">
            <FaLink />
            <input value={youtube} onChange={(e) => { setYoutube(e.target.value) }} className="grow" placeholder="Enter YouTube video link" />
          </label>
          <button onClick={() => { youtube != '' ? fetchText() : uploadPDF() }} className="w-full btn primary btn-lg">
            Upload
          </button>

          <Quiz text={text} />
        </div>
        <div className='w-1/2 h-full py-10 flex flex-col items-center'>
          <h1 className='text-3xl mb-10 font-extrabold text-secondary'>Summarized Notes</h1>
          <div className='border-2 border-slate-700 rounded-xl p-10 prose w-full'>
            {loading ? <span className="loading loading-spinner loading-lg"></span> :
              <Markdown>{text}</Markdown>
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default App
