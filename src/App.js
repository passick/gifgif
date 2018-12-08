import React, { Component } from 'react';
import YouTube from 'react-youtube';
import './App.css';
import ReactDOM from 'react-dom';
import SearchGiphy from './components/searchGiphy.js'
import GifDisplay from './components/GifDisplay';
import GifBar from './components/GifBar';
import {Rnd} from 'react-rnd';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      currentGifUrl: null,
      gifs: [],
      videoId: this.props.urlParams.get("id"),
      videoDuration: null,
      newGif: null,
      newGifX: 0, newGifY: 0,
    };
    this.player = React.createRef();
    this.gifPlayer = React.createRef();
  }

  addRelativeTimes = (gifs, duration) => {
    return gifs.map((gif) => Object.assign(
      {timeFraction: gif.time/duration},
      gif));
  }

  fetchGifs = () => {
    const result = [
      {url: 'https://media.giphy.com/media/2bV8SBlxOiU2NityCb/giphy.gif', time: 10.3},
      {url: 'https://media.giphy.com/media/Bo0ZNexSCyy9JyOXbW/giphy.gif', time: 20},
      {url: 'https://media.giphy.com/media/l4tUX3sa1D9ndNcQg/giphy.gif', time: 50}
    ];
    return new Promise((resolve, reject) => resolve(result));
  }

  getVideoDuration = (callback) => {
    return this.player.current.internalPlayer.getDuration();
  }

  onPlayerReady = () => {
    this.setState({intervalId: setInterval(this.timer, 100)});
    Promise
      .all([this.fetchGifs(), this.getVideoDuration()])
      .then(([gifs, duration]) => {
        this.setState({
          gifs: this.addRelativeTimes(gifs, duration),
          videoDuration: duration
        })
      });
  }

  timer = () => {
    try {
    this.player.current.internalPlayer
      .getCurrentTime()
      .then((time) => {
        this.setState({currentVideoTime: time})
        this.state.gifs.forEach((gif) => {
          if (Math.abs(time - gif.time) < 0.15) {
            this.setState({currentGifUrl: gif.url});
          }
        });
      });
    } catch (e) {
      clearInterval(this.state.intervalId);
    }
  }

  gifEnded = () => { this.setState({currentGifUrl: null}); }
  showGifSearch = () => { this.setState({showGifSearch: true}); }

  addNewGif = (gif) => {
    this.setState({newGif: gif, showGifSearch: false});
    this.player.current.internalPlayer.pauseVideo();
  }

  postNewGif = (gifInfo) => {
    // TODO
  }

  saveNewGif = () => {
    console.log(this.state.newGif.id);
    const gif = this.state.newGif;
    const url =  `https://media.giphy.com/media/${gif.id}/giphy.gif`;
    const time = this.state.currentVideoTime;
    const videoId = this.state.videoId;
    const videoRect = ReactDOM.findDOMNode(this.player.current).children[0]
      .getBoundingClientRect();
    const fracX = this.state.newGifX / videoRect.width;
    const fracY = this.state.newGifY / videoRect.height;
    const toSave = {url, time, videoId, x: fracX, y: fracY};
    this.postNewGif(toSave);
    this.setState({
      gifs: this.state.gifs.concat([toSave]),
      newGif: null,
      newGifX: 0, newGifY: 0
    });
  }

  render() {
    if (this.state.videoId === null) {
      return (
        <div className="App">
          Please enter video id in the url.
          Like this: <a href='?id=dQw4w9WgXcQ'>?id=dQw4w9WgXcQ</a>.
        </div>
      );
    }
    return (
      <div className="App container">
        <div className="videoFrame">
          <YouTube videoId={this.state.videoId} opts={{width: '100%', height: '100%'}}
            ref={this.player} onReady={this.onPlayerReady} />
          {this.state.newGif ?
              <Rnd enableResizing={false} height="100px" bounds="parent"
                onDragStop={(e, d) => { this.setState({newGifX: d.x, newGifY: d.y}) }}>
                <img src={this.state.newGif.images.fixed_height_small.url} />
              </Rnd>
              : ''}
          {this.state.showGifSearch ? <SearchGiphy onGifClick={this.addNewGif} /> : '' }
          <GifDisplay url={this.state.currentGifUrl} onEnd={this.gifEnded}/>
        </div>
        <GifBar gifs={this.state.gifs} onAddGif={this.showGifSearch} />
        {this.state.newGif ? 
          <button type="button" className="btn btn-primary"
            onClick={this.saveNewGif}>
            Save
          </button> 
            : ''}
      </div>
    );
  }
}

export default App;
