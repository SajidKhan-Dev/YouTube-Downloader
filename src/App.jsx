import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

function App() {
    const [url, setUrl] = useState('');
    const [videoInfo, setVideoInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [inputError, setInputError] = useState(false);

    const handleFetchVideoInfo = async () => {
        if (!url.trim()) {
            setInputError(true);
            return;
        }

        setInputError(false);
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/getVideoInfo', { url });
            const uniqueFormats = filterUniqueFormats(response.data.formats);
            setVideoInfo({ ...response.data, formats: uniqueFormats });
        } catch (error) {
            console.error('Error fetching video info', error);
        }
        setLoading(false);
    };

    const filterUniqueFormats = (formats) => {
        const uniqueFormats = [];
        const seenQualities = new Set();

        formats.forEach((format) => {
            if (!seenQualities.has(format.quality)) {
                seenQualities.add(format.quality);
                uniqueFormats.push(format);
            }
        });

        return uniqueFormats;
    };

    const handleDownload = async (itag) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/download', { url, itag });
            window.location.href = response.data.downloadLink;
        } catch (error) {
            console.error('Error downloading video', error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
            {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                </div>
            )}
            <div className={`bg-white p-8 rounded shadow-lg max-w-lg w-full ${loading ? 'opacity-50' : ''}`}>
                <h1 className="text-2xl font-bold mb-4 text-center">Download Youtube video 4K</h1>
                <p className="font-medium mb-4 text-center">Tool to download Youtube video in 1080p, 2160p, 2k, 4k, 8k</p>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube link here"
                    className={`w-full p-2 border ${inputError ? 'border-red-500' : 'border-gray-300'} rounded mb-2`}
                    disabled={loading}
                />
                {inputError && <p className="text-red-500 mb-4">Please paste a YouTube link first.</p>}
                <button
                    onClick={handleFetchVideoInfo}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-4"
                    disabled={loading}
                >
                    Start
                </button>
                {videoInfo && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-center">{videoInfo.title}</h2>
                        <img src={videoInfo.thumbnail} alt="Thumbnail" className="mx-auto mt-4 rounded" />
                        <div className="mt-4">
                            <h3 className="text-lg font-medium mb-2 text-center">Available Formats:</h3>
                            <table className="w-full table-auto">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2">Quality</th>
                                        <th className="px-4 py-2">Size</th>
                                        <th className="px-4 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {videoInfo.formats.map((format, index) => (
                                        <tr key={index} className="bg-gray-100">
                                            <td className="border px-4 py-2">{format.quality}</td>
                                            <td className="border px-4 py-2">{format.size}</td>
                                            <td className="border px-4 py-2 text-center">
                                                <button
                                                    onClick={() => handleDownload(format.itag)}
                                                    className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                                                    disabled={loading}
                                                >
                                                    Download
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
