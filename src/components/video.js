import firebase from "../firebase";
import React from "react";
import "./video.css";
import VideoRecorder from "react-video-recorder";
import serviceWorker from "../services/services";
import PropTypes from "prop-types";
import Annotations from './annotation'
// import SpeechRecognition, {
//   StartAnontation,
//   StopAnontation
// } from "./annotation";
import AuthContext from "../contexts/auth";
import { Redirect } from "react-router-dom";

const uuid = require("uuid/v1");

class Video extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      blob: null,
      url: "",
      upload: "",
      thumbnails: [],
      thumbnail: "",
      stopRecord: false,
      isRecording: false,
      preview: 0,
      func: 0,
      categoryList: [],
      description: "",
      title: ""
    };
    this.videoPlayer = React.createRef();
  }

  static contextType = AuthContext;

  componentDidMount() {
    serviceWorker.getAllCategories().then(response => {
      console.log("video", response);
      this.setState(
        {
          categoryList: response.data.data
        },
        () => console.log(this.state)
      );
    });
  }

  submit = () => {
    console.log("fire");
    this.handleFileStream();
  };

  handleFileStream = async e => {
    console.log("check", this.context.uid, this.context);
    console.log('blob',this.state.thumbnail)

    if (!this.state.blob) return;

    const root = firebase.storage().ref();

    const videoUrl = root.child(`userVideos/${this.context.uid}/${uuid()}`);
    const thumbUrl = root.child(`userThumbnail/${this.context.uid}/${uuid()}`);

    try {
      const movie = await videoUrl.put(this.state.blob);
      const movieUrl = await movie.ref.getDownloadURL();
      const thumb = await thumbUrl.put(this.state.thumbnail)
      const thumbnailUrl = await thumb.ref.getDownloadURL();
      console.log("urls",  movieUrl, thumbnailUrl);
      this.setState({
        url: movieUrl,
        thumbnail: thumbnailUrl
      });
    } catch (err) {
      console.log('error',err);
    }
  };

  handleFileInput = async e => {
    const firstFile = e.target.files[0];

    const root = firebase.storage().ref();
    const newImage = root.child(`uploads/${uuid()}/${firstFile.name}`);
    

    try {
      const snapshot = await newImage.put(firstFile);
      const url = await snapshot.ref.getDownloadURL();
      console.log(url)
      this.setState({
        upload: url
      });
      console.log(url);
    } catch (err) {
      console.log(err);
    }
  };

  preview = () => {
    if (this.state.preview === 0) {
      this.setState({
        preview: 1
      });
    } else {
      this.setState({
        preview: 0
      });
    }
  };

  setBlob = (videoblob, thumb) => {
    this.setState({
      blob: videoblob,
      thumbnail: thumb
    });
    console.log("thumbnail", thumb, videoblob);
  };

  resetBlob = () => {
    this.setState({
      blob: null
    });
  };

  reset = () => {
    console.log("hira", this.state.func);
    if (this.state.func === 0) {
      this.setState({
        func: 1
      });
    } else if (this.state.func === 1) {
      this.setState({
        func: 0
      });
    }
  };

  handleDescription = e => {
    console.log(e.currentTarget.value);
    this.setState({
      description: e.currentTarget.value
    });
  };

  handleTitle = e => {
    console.log(e.currentTarget.value);
    this.setState({
      title: e.currentTarget.value
    });
  };

  render() {
    console.log("context", this.context);
    return !this.context ? (
      <Redirect to="/login" />
    ) : this.state.categoryList.length === 0 ? (
      <div>Loading</div>
    ) : (
      <>
        <div className="entire-video-page">
          <div className="video-record-left-panel">
            <VideoRecorder
              onRecordingComplete={(
                videoblob,
                startedAt,
                thumbnailBlob,
                duration
              ) => {
                console.log(videoblob);
                console.log("thumb", thumbnailBlob);
                console.log(URL.createObjectURL(videoblob));
                this.setBlob(videoblob, thumbnailBlob);

                // const storageRef = firebase.storage().ref();
                // const ref = storageRef.child("test/test.mp4");

              // ref.put(videoblob).then(function(snapshot) {
              //   console.log("Uploaded a blob or file!", snapshot);
              // });
            }}
            isOnInitially={false}
            OnTurnOnCamera={console.log("hiya")}
            onTurnOnCamera={console.log("hiya1")}
            onTurnOffCamera={console.log("hiya2")}
            onStartRecording={() => this.reset()}
            onStopRecording={() => {
              this.reset() 
              this.setBlob() 
              return null
            }}
            // onRecordingComplete={console.log('hiya4.5')
            // }
            onOpenVideoInput={console.log("hiya5")}
            onStopReplaying={console.log("hiya6")}
          />
          <div
            className="annotation"
            style={{ opacity: `${this.state.preview}` }}
          >
            {/* <SpeechRecognition
              name={"Daniel"}
              annotations={this.startAnnontations}
            />
            <StartAnontation
              startAnnontations={this.state.func}
              name={"Daniel"}
            /> */}
            { <Annotations />}
            {/* <StopAnontation annotationState={this.state.startingAnnontations}  func={this.handleReset} reset={this.state.func} name={'Daniel'} />  */}
          </div>
          {/* ----RIGHT PANEL OF THE PAGE START HERE----- */}
          <div className="handle-record-right-panel">
            <div className="handle-title">
              <div className="form-title">Title</div>
              <input
                className="input-form"
                type="text"
                onChange={e => this.handleTitle(e)}
                placeholder="enter a title.."
                name="title"
              />
            </div>
            <div className="handle-description">
              <div className="form-title">Description</div>
              <input
                className="input-form"
                type="text"
                placeholder="include a description"
                onChange={e => this.handleDescription(e)}
                name="description"
              />
            </div>

            <div className="annotation-box">
              {/* <div style={{ opacity: `${this.state.preview}` }}> */}
              <SpeechRecognition
                name={"Daniel"}
                annotations={this.startAnnontations}
              />
              <StartAnontation
                startAnnontations={this.state.func}
                name={"Daniel"}
              />
              {/* <StopAnontation annotationState={this.state.startingAnnontations}  func={this.handleReset} reset={this.state.func} name={'Daniel'} />  */}
              {/* </div> */}

              <div className="annotation-btn-wrapper">
                <button onClick={this.preview}>Preview Annotations</button>
              </div>
              <button onClick={this.submit}>Submit</button>
            </div>
            <div>
              <input
                type="file"
                name="myfile"
                onChange={e => this.handleFileInput(e)}
                onClick={this.getFirebasetoken}
              />
            </div>
            <button onClick={this.stopRecording}>Upload File</button>
          </div>
        </div>

        

        {/* {this.state.thumbnails.map((e, i) => {
          console.log("test", e);
          const objectURL = URL.createObjectURL(e);
          console.log("url", objectURL);
          return <img src={objectURL} key={i} />;
        })} */}
      </>
    );
  }
}

export default Video;
