import React, { useState, useEffect } from 'react';

const CLIENT_ID = '56992cf24e7043a4ae32d4adca88c3e3';
const REDIRECT_URI = 'https://azhilus.github.io/BasicSpotifyController/';
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

const SpotifyController = () => {
  const [accessToken, setAccessToken] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [songInfo, setSongInfo] = useState({
    name: '',
    artist: '',
    thumbnail: '',
    duration: ''
  });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    handleAuthorizationCallback();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      const interval = setInterval(updateSongInfo, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  const authorizeSpotify = () => {
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=user-read-playback-state%20user-modify-playback-state`;
  }

  const handleAuthorizationCallback = () => {
    const params = new URLSearchParams(window.location.hash.substring(1));

    if (params.has('access_token')) {
      setAccessToken(params.get('access_token'));
      setIsAuthorized(true);
    } else {
      console.error('Access token not found in URL');
    }
  }

  const playPauseToggle = () => {
    setIsPlaying(prevState => !prevState);
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  }

  const play = () => {
    fetch(`${SPOTIFY_API_BASE_URL}/me/player/play`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  const pause = () => {
    fetch(`${SPOTIFY_API_BASE_URL}/me/player/pause`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  const nextTrack = () => {
    fetch(`${SPOTIFY_API_BASE_URL}/me/player/next`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  const prevTrack = () => {
    fetch(`${SPOTIFY_API_BASE_URL}/me/player/previous`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  const updateSongInfo = () => {
    fetch(`${SPOTIFY_API_BASE_URL}/me/player`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.item) {
          setSongInfo({
            name: data.item.name,
            artist: data.item.artists.map(artist => artist.name).join(', '),
            thumbnail: data.item.album.images[0].url,
            duration: formatDuration(data.item.duration_ms)
          });
        } else {
          setSongInfo({
            name: 'No song currently playing.',
            artist: '',
            thumbnail: '',
            duration: ''
          });
        }
      })
      .catch(error => console.error('Error fetching current playback state:', error));
  }

  const formatDuration = (duration_ms) => {
    const durationInMinutes = Math.floor(duration_ms / 60000);
    const durationInSeconds = ((duration_ms % 60000) / 1000).toFixed(0);
    return `${durationInMinutes}:${durationInSeconds.padStart(2, '0')}`;
  }

  return (
    <div id="app" style={{ width: '800px', height: '200px' }}>
      {isAuthorized ? (
        <>
          <div id="songInfo">
            <img id="thumbnail" src={songInfo.thumbnail} alt="Album Thumbnail" style={{ width: '200px', height: '200px' }} />
            <div id="details">
              <p id="songName">Song: {songInfo.name}</p>
              <p id="artist">Artist: {songInfo.artist}</p>
              <p id="duration">Duration: {songInfo.duration}</p>
            </div>
          </div>
          <button onClick={playPauseToggle}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button onClick={nextTrack}>Next Track</button>
          <button onClick={prevTrack}>Previous Track</button>
        </>
      ) : (
        <button onClick={authorizeSpotify}>Authorize Spotify</button>
      )}
    </div>
  );
}

export default SpotifyController;
